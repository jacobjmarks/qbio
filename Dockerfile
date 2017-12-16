FROM docker:latest
RUN apk update && \
    apk add --update nodejs nodejs-npm

COPY ./package.json /src/package.json
WORKDIR /src/
RUN npm install

COPY . /src/
CMD sh ./TOOLS/docker-build-all.sh && \
    sh ./TOOLS/docker-run-all.sh && \
    npm start