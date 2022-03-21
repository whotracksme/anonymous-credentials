SHELL := /bin/bash

ifeq ($(DOCKER_NEEDS_SUDO), 1)
	DOCKER_CMD := sudo docker
else
	DOCKER_CMD := docker
endif

.PHONY:
all: build-javascript-lib
	npm ci && npm run native-install

.PHONY:
build-javascript-lib:
	$(DOCKER_CMD) build . -t group-sign
	./docker-helpers/extract-files-from-image.sh dist group-sign /group-sign/dist/group-sign-wasm.js /group-sign/dist/group-sign-asmjs.js

.PHONY:
test: all
	npm test

.PHONY:
clean:
	@rm -rf build _build dist
