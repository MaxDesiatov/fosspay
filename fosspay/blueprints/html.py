from flask import Blueprint, render_template, abort, request, redirect, session, url_for, Response
from flask_login import current_user, login_user, logout_user
from datetime import datetime, timedelta
from fosspay.objects import *
from fosspay.database import db
from fosspay.common import *
from fosspay.config import _cfg, load_config
from fosspay.email import send_password_reset, send_new_account, send_new_donation, \
    send_cancellation_notice, send_account_deleted
from fosspay.currency import currency

import os
import locale
import bcrypt
import hashlib
import stripe
import binascii
import requests

encoding = locale.getdefaultlocale()[1]
html = Blueprint('html', __name__, template_folder='../../templates')


@html.route('/config')
@json_output
def get_config():
    return {
        'stripePublishableKey': _cfg("stripe-publish"),
        'stripeCountry': os.getenv('STRIPE_ACCOUNT_COUNTRY') or 'US',
        'country': 'US',
        'currency': _cfg("currency"),
        'paymentMethods': ['card'],
    }


@html.route("/setup", methods=["POST"])
def setup():
    if not User.query.count() == 0:
        abort(400)
    email = request.form.get("email")
    password = request.form.get("password")
    if not email or not password:
        return redirect(absolute_link())
    user = User(email, password)
    user.admin = True
    db.add(user)
    db.commit()
    login_user(user)
    return redirect(absolute_link("admin?first-run=1"))


@html.route("/admin")
@adminrequired
def admin():
    first = request.args.get("first-run") is not None
    projects = Project.query.all()
    unspecified = Donation.query.filter(Donation.project == None).all()
    donations = Donation.query.order_by(
        Donation.created.desc()).limit(50).all()
    return render_template(
        "admin.html",
        first=first,
        projects=projects,
        donations=donations,
        currency=currency,
        one_times=lambda p: sum(
            [d.amount for d in p.donations
             if d.type == DonationType.one_time]),
        recurring=lambda p: sum([
            d.amount for d in p.donations
            if d.type == DonationType.monthly and d.active
        ]),
        recurring_ever=lambda p: sum([
            d.amount * d.payments for d in p.donations
            if d.type == DonationType.monthly
        ]),
        unspecified_one_times=sum([
            d.amount for d in unspecified if d.type == DonationType.one_time
        ]),
        unspecified_recurring=sum([
            d.amount for d in unspecified
            if d.type == DonationType.monthly and d.active
        ]),
        unspecified_recurring_ever=sum([
            d.amount * d.payments for d in unspecified
            if d.type == DonationType.monthly
        ]),
        total_one_time=sum([
            d.amount for d in Donation.query.filter(
                Donation.type == DonationType.one_time)
        ]),
        total_recurring=sum([
            d.amount for d in Donation.query.filter(
                Donation.type == DonationType.monthly, Donation.active == True)
        ]),
        total_recurring_ever=sum([
            d.amount * d.payments for d in Donation.query.filter(
                Donation.type == DonationType.monthly)
        ]),
    )


@html.route("/create-project", methods=["POST"])
@adminrequired
def create_project():
    name = request.form.get("name")
    project = Project(name)
    db.add(project)
    db.commit()
    return redirect(absolute_link("admin"))


@html.route("/login", methods=["GET", "POST"])
def login():
    if current_user:
        if current_user.admin:
            return redirect(absolute_link("admin"))
        return redirect(absolute_link("panel"))
    if request.method == "GET":
        return render_template("login.html")
    email = request.form.get("email")
    password = request.form.get("password")
    if not email or not password:
        return render_template("login.html", errors=True)
    user = User.query.filter(User.email == email).first()
    if not user or not user.password:
        return render_template("login.html", errors=True)
    if not bcrypt.hashpw(
            password.encode('UTF-8'),
            user.password.encode('UTF-8')) == user.password.encode('UTF-8'):
        return render_template("login.html", errors=True)
    login_user(user)
    if user.admin:
        return redirect(absolute_link("admin"))
    return redirect(absolute_link("panel"))


@html.route("/logout")
@loginrequired
def logout():
    logout_user()
    return redirect(absolute_link("panel"))


def issue_password_reset(email, new_account=False):
    user = User.query.filter(User.email == email).first()
    if not user:
        return render_template(
            "reset.html",
            errors=f"No account found with this email: {email}.",
            email=email)
    if not new_account or \
        (user.password_reset_expires and user.password_reset_expires < datetime.now()):
        user.password_reset = binascii.b2a_hex(os.urandom(20)).decode("utf-8")
        user.password_reset_expires = datetime.now() + timedelta(days=1)

    if new_account:
        send_new_account(user)
    else:
        send_password_reset(user)
    db.commit()
    return render_template("reset.html", done=True)


@html.route("/create-account", methods=['GET', 'POST'])
def create_account():
    if request.method == "GET":
        email = request.args.get('email')
        return render_template("reset.html", email=email, first_reset=True)
    elif request.method == "POST":
        email = request.form.get('email')
        return issue_password_reset(email, new_account=True)


@html.route("/password-reset",
            methods=['GET', 'POST'],
            defaults={'token': None})
@html.route("/password-reset/<token>", methods=['GET', 'POST'])
def reset_password(token):
    if request.method == "GET" and not token:
        return render_template("reset.html", email=request.args.get('email'))

    if request.method == "POST":
        token = request.form.get("token")
        email = request.form.get("email")

        if email:
            return issue_password_reset(email)

        if not token:
            return redirect(absolute_link())

    user = User.query.filter(User.password_reset == token).first()
    if not user:
        return render_template("reset.html", errors="This link has expired.")

    if request.method == 'GET':
        if user.password_reset_expires == None or user.password_reset_expires < datetime.now(
        ):
            return render_template("reset.html",
                                   errors="This link has expired.")
        if user.password_reset != token:
            redirect(absolute_link())
        return render_template("reset.html", token=token)
    else:
        if user.password_reset_expires == None or user.password_reset_expires < datetime.now(
        ):
            abort(401)
        if user.password_reset != token:
            abort(401)
        password = request.form.get('password')
        if not password:
            return render_template("reset.html",
                                   token=token,
                                   errors="You need to type a new password.")
        user.set_password(password)
        user.password_reset = None
        user.password_reset_expires = None
        db.commit()
        login_user(user)
        return redirect(absolute_link("panel"))


@html.route("/panel")
@loginrequired
def panel():
    return render_template(
        "panel.html",
        all_donations=lambda u: [d for d in u.donations],
        one_times=lambda u:
        [d for d in u.donations if d.type == DonationType.one_time],
        recurring=lambda u: [
            d for d in u.donations
            if d.type == DonationType.monthly and d.active
        ],
        currency=currency)


@html.route("/cancel/<id>")
@loginrequired
def cancel(id):
    donation = Donation.query.filter(Donation.id == id).first()
    if donation.user != current_user:
        abort(401)
    if donation.type != DonationType.monthly:
        abort(400)
    donation.active = False
    db.commit()
    send_cancellation_notice(donation.user, donation)
    return redirect(absolute_link("panel"))


@html.route("/deleteAccount/<id>")
@loginrequired
def deleteAccount(id):
    user = User.query.filter(User.id == id)
    # remove user donation
    Donation.query.filter(Donation.user_id == id).delete()
    # send warm mail
    send_account_deleted(user.first())
    # remove user
    user.delete()
    db.commit()
    return redirect(absolute_link())


@html.route("/invoice/<id>")
def invoice(id):
    invoice = Invoice.query.filter(Invoice.external_id == id).first()
    if not invoice:
        abort(404)
    return render_template("invoice.html", invoice=invoice)
