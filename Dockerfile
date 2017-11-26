FROM docker:latest
COPY . /app/

RUN apk update && \
    apk add --update nodejs nodejs-npm

WORKDIR /app/
RUN npm install
CMD sh startup_script.sh

# docker run -it -p 80:3000 -v /usr/run/:/usr/run/ [IMAGE]