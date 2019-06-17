from flask import Flask, render_template, request, g, Response, redirect, url_for
from flask_login import LoginManager, current_user
from jinja2 import FileSystemLoader, ChoiceLoader

import sys
import os
import locale
import stripe
from fosspay.stripe_types import Source
from flask import Flask, render_template, jsonify, request, send_from_directory
from dotenv import load_dotenv, find_dotenv


from fosspay.config import _cfg, _cfgi
from fosspay.database import db, init_db
from fosspay.objects import User
from fosspay.common import *
from fosspay.network import *

from fosspay.blueprints.html import html

app = Flask(
    __name__, 
    static_folder=os.path.join(os.getcwd(), "support/static"),
    static_url_path='/support/static'
)
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

# STRIPE CODE
@app.route('/support/confirm_payment', methods=['POST'])
def make_payment_intent():
    # Creates a new PaymentIntent with items from the cart.
    data = json.loads(request.data)
    try:
        amount = 500
        currency = data['currency']
        # START TODO refactor this code
        payment_methods = _cfg('payment-methods').split(', ')
        while("" in payment_methods) : 
            payment_methods.remove("") 
        if len(payment_methods) == 0 :
            payment_methods = ['card']
        # END TODO 
        payment_intent = stripe.PaymentIntent.create(
            payment_method=data['payment_method_id'],
            amount=1099,
            currency='usd',
            confirmation_method='manual',
            confirm=True,
        )
        return jsonify({'paymentIntent': payment_intent})
        # return generate_payment_response(payment_intent)
    except Exception as e:
        return jsonify(e), 403


def generate_payment_response(intent):
  if intent.status == 'requires_action' and intent.next_action.type == 'use_stripe_sdk':
    # Tell the client to handle the action
    return json.dumps({
        'requires_action': True,
        'payment_intent_client_secret': intent.client_secret,
    }), 200
  elif intent.status == 'succeeded':
    # The payment didn’t need any additional actions and completed!
    # Handle post-payment fulfillment
    return json.dumps({'success': True}), 200
  else:
    # Invalid status
    return json.dumps({'error': 'Invalid PaymentIntent status'}), 500

@app.route('/support/confirm_payment/<string:id>/status', methods=['GET'])
def retrieve_payment_intent_status(id):
    payment_intent = stripe.PaymentIntent.retrieve(id)
    return jsonify({'paymentIntent': {'status': payment_intent["status"]}})
