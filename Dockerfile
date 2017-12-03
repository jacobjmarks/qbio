FROM docker:latest
COPY . /src/

RUN apk update && \
    apk add --update nodejs nodejs-npm

WORKDIR /src/
RUN npm install
CMD sh ./TOOLS/docker-build-all.sh && \
    sh ./TOOLS/docker-run-all.sh && \
    npm start

# docker run -it -p 80:3000 -v /var/run/:/var/run/ -v datavol:/src/data/ [IMAGE]