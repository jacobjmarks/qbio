FROM alpine
RUN apk update && \
    apk add --update build-base bash
COPY /src/ /SigClust/
WORKDIR /SigClust/
RUN make