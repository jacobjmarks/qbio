FROM docker:latest AS server
RUN apk update && \
    apk add --update nodejs nodejs-npm

FROM server AS node_modules
COPY ./package.json /src/package.json
WORKDIR /src/
RUN npm install

FROM node_modules AS application
COPY . /src/
CMD sh ./TOOLS/docker-build-all.sh && \
    sh ./TOOLS/docker-run-all.sh && \
    npm start