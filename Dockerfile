FROM node:18.13.0 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginxinc/nginx-unprivileged:latest
USER root
RUN mkdir /app
COPY --from=build /app/nginx /etc/nginx/conf.d/
USER nginx
WORKDIR /app
COPY --from=build /app/build /app/html