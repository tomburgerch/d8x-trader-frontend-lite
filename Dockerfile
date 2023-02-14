FROM node:18.13.0 AS build

ARG REACT_APP_API_URL
ARG REACT_APP_WEBSOCKET_URL

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN echo "REACT_APP_WEBSOCKET_URL=${REACT_APP_WEBSOCKET_URL}\n""REACT_APP_API_URL=${REACT_APP_API_URL}" > .env

RUN npm run build

FROM nginxinc/nginx-unprivileged:latest
USER root
RUN mkdir /app
COPY --from=build /app/nginx /etc/nginx/conf.d/
USER nginx
WORKDIR /app
COPY --from=build /app/build /app/html