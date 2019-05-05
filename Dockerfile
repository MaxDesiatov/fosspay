FROM tiangolo/uwsgi-nginx-flask:python3.6-alpine3.8

RUN apk --update add build-base python3-dev postgresql-client postgresql-dev \
  musl-dev libffi-dev
COPY . /app
RUN pip install --user pipenv

WORKDIR /app

RUN ~/.local/bin/pipenv install --system
