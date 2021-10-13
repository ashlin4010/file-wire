FROM node:14

WORKDIR /usr/app

COPY package*.json ./
COPY lerna.json ./

COPY packages/*/package*.json ./packages/

RUN npm install

COPY . .

RUN npx lerna bootstrap --hoist

RUN npm run build-server

EXPOSE 8080
#CMD npm run start-server