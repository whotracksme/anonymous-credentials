FROM emscripten/emsdk@sha256:a4500d8b42b09a255c9517a06b019de52334b0f05af3f0b62529f27e83ff5247
RUN mkdir /group-sign
COPY . /group-sign
WORKDIR /group-sign
RUN ./build-emscripten.sh
