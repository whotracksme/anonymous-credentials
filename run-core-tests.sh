#!/bin/bash

# compiler used to build the tests
readonly cxx=${CXX:-clang++}
readonly cc=${CC:-clang}
readonly from_scratch=${FROM_SCRATCH:-false}

docker build -f Dockerfile.coretests -t group-sign-test-image .
docker run -v $(pwd):/host-system \
           -e CXX="$cxx" \
           -e CC="$cc" \
           -e FROM_SCRATCH="$from_scratch" \
           -it --rm group-sign-test-image
