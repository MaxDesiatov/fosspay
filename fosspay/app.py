from flask import Flask, render_template, request, g, Response, redirect, url_for, jsonify
from flask_login import LoginManager, current_user
from jinja2 import FileSystemLoader, ChoiceLoader
from sqlalchemy.ext.declarative import DeclarativeMeta

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
from fosspay.email import send_thank_you, send_new_donation

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


@app.route('/sponsor/initial_state', methods=['GET'])
def initial_state():
    projects = Project.query.all()
    return Response(f'window.initialState = \
        {json.dumps({"projects": projects}, cls=AlchemyEncoder)};',
                    mimetype='application/javascript')


@app.route('/sponsor/checkout_session', methods=['POST'])
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
        success_url=_cfg("protocol") + "://" + _cfg("domain"),
        cancel_url=_cfg("protocol") + "://" + _cfg("domain"),
    )

    return jsonify({'session_id': session.id, 'amount': data['amount']})
