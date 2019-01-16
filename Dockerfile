# sdk-tag-1.38.23-64bit
FROM trzeci/emscripten@sha256:86cb31ea2c55cfb387e723ef5f473c15a7ed7ccf01c0f9e40d4b9131e1e7a22a

RUN mkdir /group-sign
COPY . /group-sign
WORKDIR /group-sign
RUN ./build-emscripten.sh
