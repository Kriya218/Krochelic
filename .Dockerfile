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
COPY . .

RUN dos2unix /app/entrypoint.sh /app/wait-for-it.sh
RUN chmod +x /app/entrypoint.sh /app/wait-for-it.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]