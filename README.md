# fosspay [![Donate with fosspay](https://drewdevault.com/donate/static/donate-with-fosspay.png)](https://drewdevault.com/donate?project=3)

Donation collection for FOSS groups and individuals.

* Supports one-time and monthly donations
* Process cards with Stripe
* Flexible and customizable

It works for individuals (like me) and it works for organizations. Expect to
spend about an hour or two setting up everything and then you're good to go.

For support, visit [#cmpwn on
irc.freenode.net](http://webchat.freenode.net/?channels=cmpwn&uio=d4)
or file a GitHub issue.

## Before you start

You will need a number of things set up before you start:

1. An approved [Stripe](https://stripe.com/) account
1. A mail server
1. A domain name and an SSL certificate
1. A web server to host fosspay on

## Installation

Install these things:

* Python 3
* [pipenv](https://github.com/pypa/pipenv/)
* PostgreSQL

You're responsible for setting up PostgreSQL yourself. Prepare a connection
string for later.

Clone the git repository on the server that you want to host fosspay on:

    git clone git://github.com/SirCmpwn/fosspay.git
    cd fosspay

Install the Python packages:

    pipenv install

Compile the static assets:

    make

Create a configuration file:

    cp config.ini.example config.ini

Edit `config.ini` to your liking.

Activate the virtual environment associated with project.

    pipenv shell

Then, you can run the following to start up
the development server:

    python3 app.py

Log into http://your-domain:5000, and you will receive further instructions.

## Deployment

Once you have everything configured, you will need to switch from the dev server
into something more permanent. Install gunicorn on your server and use the
systemd unit provided in `contrib/`. You will also probably want to run this
through nginx instead of directly exposing gunicorn to the web, see
`contrib/nginx.conf`. Neither the nginx configuration or the systemd unit are
immediately ready to use - read them and change them to suit your needs.

Using nginx or something like it is necessary for SSL support, and you must
serve your site with https for Stripe to work.
