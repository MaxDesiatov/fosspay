from flask import Flask, render_template, request, g, Response, redirect, url_for, jsonify
from flask_login import LoginManager, current_user
from jinja2 import FileSystemLoader, ChoiceLoader
from sqlalchemy.ext.declarative import DeclarativeMeta
from numbers import Number

import sys
import os
import locale
import stripe
import binascii

from fosspay.config import _cfg, _cfgi
from fosspay.database import db, init_db
from fosspay.objects import User, Donation, DonationType, Project
from fosspay.common import *
from fosspay.network import *
from fosspay.blueprints.html import html
from datetime import datetime, timedelta
from fosspay.email import send_thank_you, send_new_donation, send_subscription_confirmation

app = Flask(__name__,
            static_folder=os.path.join(os.getcwd(), "frontend/build"),
            static_url_path='/sponsor')
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

app.register_blueprint(html, url_prefix='/sponsor')


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


class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [
                    x for x in dir(obj)
                    if not x.startswith('_') and x != 'metadata'
            ]:
                data = obj.__getattribute__(field)
                try:
                    json.dumps(
                        data
                    )  # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    fields[field] = None
            # a json-encodable dict
            return fields

        return json.JSONEncoder.default(self, obj)


@app.route("/sponsor/")
def index():
    return app.send_static_file('index.html')


@app.route('/sponsor/initial_state', methods=['GET'])
def initial_state():
    projects = Project.query.all()
    return Response(
        f'window.initialState = {json.dumps({"projects": projects}, cls=AlchemyEncoder)};',
        mimetype='application/javascript')


@app.route('/sponsor/email_subscription', methods=['POST'])
def email_subscribtion():
    data = json.loads(request.data)
    email = 'email' in data and data['email']
    if email:
        user = User.query.filter(User.email == email).first()
        if not user:
            user = User(email)
            user.is_public = False
            user.email_updates = True
            db.add(user)
        else:
            user.email_updates = True
        db.commit()
        send_subscription_confirmation(user)
        return jsonify({})
    else:
        return jsonify({'error': 'no email provided'})


@app.route('/sponsor/checkout_session', methods=['POST'])
def checkout_session():
    data = json.loads(request.data)

    is_subscription = 'isSubscription' in data and data['isSubscription']

    if not type(is_subscription) == bool:
        raise ValueError(f'invalid is_subscription value: {is_subscription}')

    email = 'email' in data and data['email']

    args = {
        'payment_method_types': ['card'],
        'cancel_url': _cfg("protocol") + "://" + _cfg("domain")
    }

    is_existing_account = False

    user = None
    if email:
        is_public = 'isPublic' in data and data['isPublic']
        email_updates = 'emailUpdates' in data and data['emailUpdates']
        user = User.query.filter(User.email == email).first()
        if not user:
            user = User(email)
            user.stripe_customer = stripe.Customer.create(email=email).id
            db.add(user)
        else:
            is_existing_account = True

        user.is_public = is_public
        user.email_updates = email_updates
        args['customer'] = user.stripe_customer

        if not user.stripe_customer:
            args['customer_email'] = email

    args['success_url'] = \
        _cfg("protocol") + "://" + _cfg("domain") + '/?success=' + \
        (f'monthly&email={email}' if is_subscription else 'once') + \
        (f'&is_existing_account=true' if is_existing_account else '')

    amount = data['amount']

    if not isinstance(amount, Number):
        raise ValueError(f'invalid checkout amount specified: {amount}')

    if is_subscription:
        whole_amount = int(amount / 100)
        try:
            plan = stripe.Plan.retrieve(f'desiatov_mo_sp_{whole_amount}_usd')
        except stripe.error.InvalidRequestError:
            plan = stripe.Plan.create(amount=amount,
                                      interval="month",
                                      product=_cfg('product_id'),
                                      currency="usd",
                                      nickname=f'Monthly {whole_amount} USD',
                                      id=f"desiatov_mo_sp_{whole_amount}_usd")
        args['subscription_data'] = {
            'items': [{
                'plan': plan.id,
            }],
        }
    else:
        args['line_items'] = [{
            'name': 'desiatov.com sponsorship fee',
            'amount': amount,
            'currency': 'usd',
            'quantity': 1,
        }]

    session = stripe.checkout.Session.create(**args)

    project_id = ('projectID' in data and data['projectID']) or None
    comments = 'comments' in data and data['comments']
    ty = DonationType.monthly if is_subscription else DonationType.one_time
    donation = Donation(user, ty, amount, session.id, project_id, comments)
    try:
        db.add(donation)
        db.commit()
    except Exception as e:
        print(e)
        return jsonify({'success': False})

    return jsonify({'sessionId': session.id, 'amount': data['amount']})


@app.route('/sponsor/webhook', methods=['POST'])
def webhook():
    payload = request.data
    sig_header = request.headers['Stripe-Signature']
    event = None

    try:
        event = stripe.Webhook.construct_event(payload, sig_header,
                                               _cfg("stripe_endpoint_secret"))
    except ValueError as e:
        # Invalid payload
        return ('', 400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return ('', 400)

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        donation = Donation.query.filter(
            Donation.session_id == session.id).first()

        if not donation:
            # Matching donation not found
            return ('', 400)

        if 'data' in event and 'object' in event['data'] and \
            'subscription' in event['data']['object']:
            donation.stripe_subscription_id = event['data']['object'][
                'subscription']

        customer = stripe.Customer.retrieve(session['customer'])

        user = User.query.filter(User.email == customer.email).first()

        is_existing_user = True
        if not user:
            is_existing_user = False
            user = User(customer.email)
            user.is_public = False
            user.email_updates = False
            user.stripe_customer = customer.id
            db.add(user)

        user_donations = Donation.query.filter(
            Donation.user_id == user.id).filter(
                Donation.type == DonationType.monthly)
        if user_donations.count() == 1 and user_donations.first(
        ).id == donation.id:
            is_existing_user = False

        donation.user = user
        donation.session_is_complete = True

        try:
            send_new_donation(user, donation)
            # Monthly subscribers have accepted privacy policy by this point,
            # so send them a password reset so that they can log in later and
            # manager their subscriptions.
            if donation.type == DonationType.monthly:
                user.set_password_reset()
            db.commit()
            send_thank_you(donation, is_existing_user=is_existing_user)
        except Exception as e:
            print(e)
            return jsonify({'success': False})

    return ('', 200)
