FROM node:alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

CMD npm run dev