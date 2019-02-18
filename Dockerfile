# sdk-tag-1.38.27-64bit
FROM trzeci/emscripten@sha256:14ac3cc8e7aef67d44f51233d8fb4b26b7922c571df27e8645b64d8f11f9fd88

RUN mkdir /group-sign
COPY . /group-sign
WORKDIR /group-sign
RUN ./build-emscripten.sh
