FROM node:15
WORKDIR /usr/app
COPY package*.json ./
COPY lerna.json ./
COPY packages/*/package*.json ./packages/
RUN npm install
COPY . .
RUN npm run bootstrap
RUN npm run build
RUN npm run build-web-client
RUN npm run build-server
RUN cp -r ./packages/client-web/build ./packages/file-wire-server/dest/public/

CMD npm run start-server
EXPOSE 8080