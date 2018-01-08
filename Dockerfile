FROM docker:latest AS server
RUN apk update && \
    apk add --update nodejs nodejs-npm bash

FROM server AS node_modules
COPY ./package.json /src/package.json
WORKDIR /src/
RUN npm install

FROM node_modules AS application
COPY . /src/
CMD if [ "$RUN_TOOLS" = "true" ]; then bash qbio launch tools; fi; \
    npm start