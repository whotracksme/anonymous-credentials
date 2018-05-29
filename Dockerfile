FROM trzeci/emscripten:sdk-tag-1.38.0-64bit@sha256:3d979a44c88bde8528bfab5f4f340c8df033ce34dff143b5c4a5eb69d0510b9e

RUN mkdir /group-sign
COPY . /group-sign
WORKDIR /group-sign
RUN ./build-emscripten.sh
