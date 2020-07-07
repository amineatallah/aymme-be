FROM node:alpine as development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

FROM node:alpine as base

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

FROM node:alpine as production

ENV DB_HOST=mongodb://mongo/
ENV DB_NAME=aymme
ENV PROJECT_NAME=BB-PROJECT

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY --from=base /usr/src/app/dist ./dist

CMD [ "node", "dist/main" ]