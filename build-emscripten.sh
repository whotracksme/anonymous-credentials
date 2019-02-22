#!/bin/bash

set -e
set -x

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
BUILDFOLDER="$SCRIPTPATH/_build/embuild"
DISTFOLDER="$SCRIPTPATH/dist"

if [ -z "$EMSCRIPTEN" ]
then
  EMSCRIPTEN_PATH=${EMSCRIPTEN_PATH:-~/emsdk}

  if [ ! -f "$EMSCRIPTEN_PATH/emsdk_env.sh" ]; then
      echo "emscripten installation not found" ;
      exit 1 ;
  fi

  . "$EMSCRIPTEN_PATH/emsdk_env.sh"
fi

if [ -z "$BUILD_TYPE" ]
then
  . ./config.release
fi

# Emscripten compiler:
AR=emar
CC=emcc
CXX=em++

. ./build-common.sh

name_0="wasm"
flags_0="-s TOTAL_MEMORY=128KB -s TOTAL_STACK=64KB -s WASM=1 -s EXPORT_NAME='ModuleWasm'"
name_1="asmjs"
flags_1="-s WASM=0 -s EXPORT_NAME='ModuleAsmjs'"

rm -rf $DISTFOLDER;

for emidx in 0 1
do
EMNAME="name_$emidx"
EMNAME=${!EMNAME}
EMFLAGS="flags_$emidx"
EMFLAGS=${!EMFLAGS}

( mkdir -p $DISTFOLDER && \
  emcc ${EMFLAGS} \
    --pre-js pre.js \
    -s SINGLE_FILE=1 \
    -s MODULARIZE=1 \
    -s NO_EXIT_RUNTIME=1 \
    -s ASSERTIONS=$EMCC_ASSERTIONS \
    $EMCC_FLAGS \
    -std=c11 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align \
    -Wunused-variable -Wundef -Wformat-security -Wshadow \
    -o "$DISTFOLDER/group-sign-$EMNAME.js" \
    -rdynamic \
    $BUILDFOLDER/group-sign.o \
    $BUILDFOLDER/amcl.a \
    -s EXPORTED_FUNCTIONS="[\
       '_GS_seed', \
       '_GS_setupGroup', \
       '_GS_loadGroupPrivKey', \
       '_GS_loadGroupPubKey', \
       '_GS_loadUserCredentials', \
       '_GS_exportGroupPrivKey', \
       '_GS_exportGroupPubKey', \
       '_GS_exportUserCredentials', \
       '_GS_processJoin', \
       '_GS_sign', \
       '_GS_verify', \
       '_GS_getSignatureTag', \
       '_GS_initState', \
       '_GS_startJoin', \
       '_GS_finishJoin', \
       '_GS_version', \
       '_GS_big', \
       '_GS_field', \
       '_GS_curve', \
       '_GS_success', \
       '_GS_failure', \
       '_GS_error', \
       '_GS_getStateSize']")
done
