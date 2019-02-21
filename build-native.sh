#!/bin/bash

set -e
set -x

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
BUILDFOLDER="$SCRIPTPATH/_build/nativebuild"

if [ -z "$BUILD_TYPE" ]
then
  . ./config.default
fi

# Native compiler:
AR=${AR:-llvm-ar}
CC=${CC:-clang}
CXX=${CXX:-clang++}

. ./build-common.sh