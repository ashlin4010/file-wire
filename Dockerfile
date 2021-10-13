FROM node:15

WORKDIR /usr/app

COPY package*.json ./
COPY lerna.json ./

COPY packages/client-cli/package*.json ./packages/client-cli/
COPY packages/client-web/package*.json ./packages/client-web/
COPY packages/common-file-system/package*.json ./packages/common-file-system/
COPY packages/file-wire-server/package*.json ./packages/file-wire-server/
COPY packages/rtc-connection/package*.json ./packages/rtc-connection/
COPY packages/rtc-controller/package*.json ./packages/rtc-controller/
COPY packages/ws-domain/package*.json ./packages/ws-domain/


RUN npm install
RUN npx lerna bootstrap

COPY . .
RUN npm run build-server


EXPOSE 8080
#CMD npm run start-server