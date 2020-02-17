FROM node:12 as base

WORKDIR /usr/src/app

COPY ./ ./
RUN npm ci
RUN npm run build

FROM node:alpine as production

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY --from=base /usr/src/app/dist ./dist

CMD [ "node", "dist/main" ]