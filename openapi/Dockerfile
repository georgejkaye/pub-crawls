FROM node:25-alpine

WORKDIR /app

COPY ./openapi.js openapi.js
COPY ./package.json package.json

RUN npm i -D openapi-typescript

ENTRYPOINT [ "node", "openapi.js" ]

