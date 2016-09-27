FROM ubuntu:latest
MAINTAINER Jan Blaha
EXPOSE 4000

RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - && \
    apt-get install -y nodejs

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production

COPY . /usr/src/app

COPY . /usr/src/app/patch

HEALTHCHECK CMD curl --fail http://localhost:4000 || exit 1

CMD [ "node", "index.js" ]