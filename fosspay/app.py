from flask import Flask, render_template, request, g, Response, redirect, url_for
from flask_login import LoginManager, current_user
from jinja2 import FileSystemLoader, ChoiceLoader

import sys
import os
import locale
import stripe
import binascii
from flask import Flask, render_template, jsonify, request

from fosspay.config import _cfg, _cfgi
from fosspay.database import db, init_db
from fosspay.objects import User, Donation, DonationType, Project
from fosspay.common import *
from fosspay.network import *
from fosspay.blueprints.html import html
from datetime import datetime, timedelta
from fosspay.email import send_thank_you, send_new_donation

app = Flask(__name__,
            static_folder=os.path.join(os.getcwd(), "support/static"),
            static_url_path='/support/static')
app.secret_key = _cfg("secret-key")
app.jinja_env.cache = None
init_db()
login_manager = LoginManager()
login_manager.init_app(app)

app.jinja_loader = ChoiceLoader([
    FileSystemLoader("overrides"),
    FileSystemLoader("templates"),
])

stripe.api_key = _cfg("stripe-secret")


@login_manager.user_loader
def load_user(email):
    return User.query.filter(User.email == email).first()


login_manager.anonymous_user = lambda: None

app.register_blueprint(html, url_prefix='/support')


@app.after_request
def add_header(response):
    if ('Cache-Control' not in response.headers):
        response.headers['Cache-Control'] = 'private, max-age=0'
    return response


try:
    locale.setlocale(locale.LC_ALL, 'en_US')
except:
    pass

if not app.debug:

    @app.errorhandler(500)
    def handle_500(e):
        # shit
        try:
            db.rollback()
            db.close()
        except:
            # shit shit
            print("We're very borked, letting init system kick us back up")
            sys.exit(1)
        return render_template("internal_error.html"), 500


@app.errorhandler(404)
def handle_404(e):
    return render_template("not_found.html"), 404


@app.context_processor
def inject():
    return {
        'root': _cfg("protocol") + "://" + _cfg("domain"),
        'domain': _cfg("domain"),
        'protocol': _cfg("protocol"),
        'blog': _cfg("protocol") + "://" + _cfg("blog"),
        'len': len,
        'any': any,
        'request': request,
        'locale': locale,
        'url_for': url_for,
        'absolute_link': absolute_link,
        'user': current_user,
        '_cfg': _cfg,
        '_cfgi': _cfgi,
        'debug': app.debug,
        'str': str,
        'int': int
    }


@app.route('/support/checkout_session', methods=['POST'])
def checkout_session():
    data = json.loads(request.data)
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'name': 'Sponsorship fee',
            'amount': data['amount'],
            'currency': 'usd',
            'quantity': 1,
        }],
        success_url='https://desiatov.com/',
        cancel_url='https://example.com/cancel',
    )

    return json.dumps({'session_id': session.id, 'amount': data['amount']})


@app.route('/support/confirm_payment', methods=['POST'])
def make_payment_intent():
    data = json.loads(request.data)

    intent = None
    userData = None

    if 'userData' in data:
        userData = data['userData']

    try:
        if 'payment_method_id' in data:
            email = data["email"]
            payment_method_id = data['payment_method_id']
            amount = data["amount"]
            payment_type = data["type"]
            comment = data["comment"]
            project_id = data["project"]
            source = data["source"]
            # Validate and rejigger the form inputs
            if not email or not payment_method_id or not amount or not payment_type:
                error = "Invalid request. "
                if not email:
                    error += "No email."
                if not payment_method_id:
                    error += "No payment_method_id."
                if not amount:
                    error += "No amount."
                if not payment_type:
                    error += "No type."
                return {"success": False, "error": error}, 400
            if project_id is None or project_id == "null":
                project = None
            else:
                project_id = int(project_id)
                project = Project.query.filter(
                    Project.id == project_id).first()

            if payment_type == "once":
                payment_type = DonationType.one_time
            else:
                payment_type = DonationType.monthly

            amount = int(amount)

            # Create new user if not exist, or update the old user payment
            # source if the user already in the database
            new_account = False
            user = User.query.filter(User.email == email).first()
            if not user:
                new_account = True
                user = User(email,
                            binascii.b2a_hex(os.urandom(20)).decode("utf-8"))
                user.password_reset = binascii.b2a_hex(
                    os.urandom(20)).decode("utf-8")
                user.password_reset_expires = datetime.now() + timedelta(
                    days=1)
                customer = stripe.Customer.create(email=user.email,
                                                  source=source["id"])

                # Attach payment method to the customer:
                stripe.PaymentMethod.attach(payment_method_id,
                                            customer=customer.id)

                user.stripe_customer = customer.id

                # Add user to the database
                db.add(user)

                # Save user data to pass it to the client
                userData = {
                    "new_account": new_account,
                    "password_reset": user.password_reset
                }
            else:
                # Save user data to pass it to the client
                userData = {"new_account": new_account}

            try:
                # Create the PaymentIntent
                amount = data['amount']
                intent = stripe.PaymentIntent.create(
                    payment_method=data['payment_method_id'],
                    amount=amount,
                    currency=_cfg("currency"),
                    confirmation_method='manual',
                    confirm=True,
                    save_payment_method=True,
                    customer=user.stripe_customer,
                )

                # Add new donation to the database
                donation = Donation(user, payment_type, amount, project,
                                    comment)
                db.add(donation)
            except stripe.error.CardError as e:
                db.rollback()
                db.close()
                return {
                    "success": False,
                    "error": "Your card was declined."
                }, 400
            except Exception as e:
                error = "Invalid request. " + e.user_message
                return {"success": False, "error": error}, 400

            db.commit()

            send_thank_you(user, amount, payment_type == DonationType.monthly)
            send_new_donation(user, donation)
        elif 'payment_intent_id' in data:
            # Fulfill the secure payment
            intent = stripe.PaymentIntent.confirm(data['payment_intent_id'])

    except stripe.error.CardError as e:
        # Display error on client
        error = "Invalid request. " + e.user_message
        return {"success": False, "error": error}, 400

    return generate_payment_response(intent, userData)


def generate_payment_response(intent, userData):
    if intent.status == 'requires_action' and intent.next_action.type == 'use_stripe_sdk':
        # Tell the client to handle the action
        return json.dumps({
            'requires_action': True,
            'payment_intent_client_secret': intent.client_secret,
            'userData': userData
        }), 200
    elif intent.status == 'succeeded':
        # The payment didn't need any additional actions and completed
        # Handle the post-payment fulfillment
        return json.dumps({
            'success': True,
            'intent': intent,
            'userData': userData
        }), 200
    else:
        # Invalid status
        return json.dumps({
            'success': False,
            'error': 'Invalid PaymentIntent status'
        }), 400


@app.route('/support/confirm_payment/<string:id>/status', methods=['GET'])
def retrieve_payment_intent_status(id):
    payment_intent = stripe.PaymentIntent.retrieve(id)
    return jsonify({'paymentIntent': {'status': payment_intent["status"]}})
