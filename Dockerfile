#!/bin/bash
FROM node:18-alpine3.19
WORKDIR /app
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  bash \
  && rm -rf /var/cache/apk/*
COPY package*.json ./
RUN npm install

COPY config/config.json /app/config/config.json
COPY . .

COPY entrypoint.sh /usr/entrypoint.sh
COPY wait-for-it.sh /usr/wait-for-it.sh

RUN dos2unix /usr/entrypoint.sh /usr/wait-for-it.sh
RUN chmod +x /usr/entrypoint.sh /usr/wait-for-it.sh
RUN ls -l /app
EXPOSE 3000
ENTRYPOINT ["/usr/entrypoint.sh"]