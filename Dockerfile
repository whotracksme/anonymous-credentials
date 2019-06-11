FROM trzeci/emscripten:sdk-tag-1.38.32-64bit@sha256:f352ee6980d98338453f3c6cf6beb79142fcb77e73198b7de170edc88f25d36b
RUN apt-get update && apt-get install -y python3
RUN mkdir /group-sign
COPY . /group-sign
WORKDIR /group-sign
RUN ./build-emscripten.sh
