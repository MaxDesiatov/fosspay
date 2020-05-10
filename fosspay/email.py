import smtplib
import pystache
import os
import html.parser
from email.mime.text import MIMEText
from email.utils import localtime, format_datetime
from werkzeug.utils import secure_filename
from flask import url_for

from fosspay.database import db
from fosspay.objects import User, DonationType
from fosspay.config import _cfg, _cfgi
from fosspay.currency import currency


def send_subscription_confirmation(user):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/subscription-confirmation") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "your_email": _cfg("your-email")
            })))
    message[
        'Subject'] = f"Subscription confirmation for {_cfg('site-name')} sponsorship"
    message['From'] = _cfg("smtp-from")
    message['To'] = user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [user.email], message.as_string())
    smtp.quit()


def send_thank_you(donation, is_existing_user):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/thank-you") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": donation.user,
                "is_existing_user": is_existing_user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "amount": currency.amount("{:.2f}".format(donation.amount / 100)),
                "monthly": donation.type == DonationType.monthly,
                "your_email": _cfg("your-email")
            })))
    message['Subject'] = "Thank you for your sponsorship!"
    message['From'] = _cfg("smtp-from")
    message['To'] = donation.user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [donation.user.email],
                  message.as_string())
    smtp.quit()


def send_password_reset(user):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/reset-password") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "your_email": _cfg("your-email")
            })))
    message['Subject'] = f"Reset your {_cfg('site-name')} sponsorship password"
    message['From'] = _cfg("smtp-from")
    message['To'] = user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [user.email], message.as_string())
    smtp.quit()


def send_new_account(user):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/new-account") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "your_email": _cfg("your-email")
            })))
    message[
        'Subject'] = f"Set a password for your new {_cfg('site-name')} sponsorship account"
    message['From'] = _cfg("smtp-from")
    message['To'] = user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [user.email], message.as_string())
    smtp.quit()


def send_declined(user, amount):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/declined") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "amount": currency.amount("{:.2f}".format(amount / 100))
            })))
    message['Subject'] = "Your monthly donation was declined."
    message['From'] = _cfg("smtp-from")
    message['To'] = user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [user.email], message.as_string())
    smtp.quit()


def send_new_donation(user, donation):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/new-donation") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "amount": currency.amount("{:.2f}".format(
                    donation.amount / 100)),
                "frequency": (" per month"
                    if donation.type == DonationType.monthly else ""),
                "comment": donation.comment or "",
            })))
    message['Subject'] = "New donation on fosspay!"
    message['From'] = _cfg("smtp-from")
    message['To'] = f"{_cfg('your-name')} <{_cfg('your-email')}>"
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [_cfg('your-email')], message.as_string())
    smtp.quit()


def send_admin_cancellation_notice(user, donation):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/admin-cancelled") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "amount": currency.amount("{:.2f}".format(
                    donation.amount / 100)),
            })))
    message[
        'Subject'] = f"A monthly donation at {_cfg('site-name')} has been cancelled"
    message['From'] = _cfg("smtp-from")
    message['To'] = f"{_cfg('your-name')} <{_cfg('your-email')}>"
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [_cfg('your-email')], message.as_string())
    smtp.quit()


def send_cancellation_notice(user, donation):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/cancelled") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(\
            pystache.render(f.read(), {
                "user": user,
                "root": _cfg("protocol") + "://" + _cfg("domain"),
                "your_name": _cfg("your-name"),
                "your_email": _cfg("your-email"),
                "amount": currency.amount("{:.2f}".format(
                    donation.amount / 100)),
            })))
    message[
        'Subject'] = f"Your monthly sponsorship at {_cfg('site-name')} has been cancelled"
    message['From'] = _cfg("smtp-from")
    message['To'] = user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [user.email], message.as_string())
    smtp.quit()


def send_admin_account_deleted(user, total_amount):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/admin-account-deleted") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(
            pystache.render(
                f.read(), {
                    "user": user,
                    "root": _cfg("protocol") + "://" + _cfg("domain"),
                    "your_name": _cfg("your-name"),
                    "your_email": _cfg("your-email"),
                    "amount": currency.amount("{:.2f}".format(
                        total_amount / 100))
                })))
    message[
        'Subject'] = f"Your account at {_cfg('site-name')} has been deleted"
    message['From'] = _cfg("smtp-from")
    message['To'] = f"{_cfg('your-name')} <{_cfg('your-email')}>"
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [_cfg('your-email')], message.as_string())
    smtp.quit()


def send_account_deleted(user, had_active_monthly_sponsorship):
    if _cfg("smtp-host") == "":
        return
    smtp = smtplib.SMTP(_cfg("smtp-host"), _cfgi("smtp-port"))
    smtp.ehlo()
    smtp.starttls()
    smtp.login(_cfg("smtp-user"), _cfg("smtp-password"))
    with open("emails/goodbye") as f:
        message = MIMEText(html.parser.HTMLParser().unescape(
            pystache.render(
                f.read(), {
                    "root":
                    _cfg("protocol") + "://" + _cfg("domain"),
                    "your_name":
                    _cfg("your-name"),
                    "your_email":
                    _cfg("your-email"),
                    "had_active_monthly_sponsorship":
                    had_active_monthly_sponsorship
                })))
    message['Subject'] = "Your account has been deleted."
    message['From'] = _cfg("smtp-from")
    message['To'] = user.email
    message['Date'] = format_datetime(localtime())
    smtp.sendmail(_cfg("smtp-from"), [user.email], message.as_string())
    smtp.quit()
