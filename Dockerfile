FROM node:15

WORKDIR /usr/app

COPY package*.json ./
COPY lerna.json ./

COPY packages/*/package*.json ./packages/

RUN npm install
COPY . .
RUN npx lerna bootstrap --hoist
RUN npm run build

CMD npm run start-server

EXPOSE 8080