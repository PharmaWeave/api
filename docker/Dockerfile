FROM node:22-alpine AS base

ENV FORCE_COLOR=1

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

RUN apk update && apk upgrade && apk add --no-cache bash

COPY ../package.json ../package-lock.json ../tsconfig.json ../.env ../.env.test ../vitest.config.ts ../vitest.setup.ts ../babel.config.js ./

RUN npm install

COPY ../src/ src/

ENTRYPOINT ["/home/node/app/src/config/entrypoint.sh"]
