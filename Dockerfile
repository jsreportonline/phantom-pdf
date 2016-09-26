FROM node:4.4
MAINTAINER Jan Blaha
EXPOSE 3000

RUN apt-get update && apt-get install -y sudo
RUN npm install npm -g

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production

COPY . /usr/src/app

COPY . /usr/src/app/patch

EXPOSE 4000

HEALTHCHECK CMD curl --fail http://localhost:4000 || exit 1

CMD [ "node", "index.js" ]