FROM node:lts-alpine AS build

COPY frontend /frontend
WORKDIR /frontend
RUN yarn
RUN yarn build

FROM tiangolo/uwsgi-nginx-flask:python3.6-alpine3.8

RUN apk --update add build-base python3-dev postgresql-client postgresql-dev \
  musl-dev libffi-dev nodejs nodejs-npm
COPY . /app
COPY --from=build /frontend/build /app/frontend/build
RUN pip install --user pipenv

WORKDIR /app/frontend

WORKDIR /app

RUN ~/.local/bin/pipenv install --system
