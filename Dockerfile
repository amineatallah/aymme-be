FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY dist/ ./dist

CMD [ "node", "dist/main" ]