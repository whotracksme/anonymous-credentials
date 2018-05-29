SHELL := /bin/bash

.PHONY:
all: build-javascript-lib
	npm install && npm run native-install

.PHONY:
build-javascript-lib:
	docker build . -t group-sign
	./docker-helpers/extract-files-from-image.sh dist group-sign /group-sign/dist/group-sign-wasm.js /group-sign/dist/group-sign-asmjs.js

.PHONY:
test: all
	npm test

.PHONY:
clean:
	@rm -rf build _build dist
