# sdk-tag-1.38.8-64bit
FROM trzeci/emscripten@sha256:e709ba53b68dac8c52761cb34c53543643387459d3166e465ed6b8fa2dc281f2

RUN mkdir /group-sign
COPY . /group-sign
WORKDIR /group-sign
RUN ./build-emscripten.sh
