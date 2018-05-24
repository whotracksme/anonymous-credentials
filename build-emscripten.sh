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

( rm -rf $BUILDFOLDER && mkdir -p $BUILDFOLDER && \
    cd $BUILDFOLDER && \
    emcmake cmake \
      -DENABLE_TESTS=$ENABLE_TESTS \
      -DCMAKE_C_FLAGS="$CFLAGS" \
      -DCMAKE_CXX_FLAGS="$CXXFLAGS" \
      -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
      -DBUILD_SHARED_LIBS=OFF \
      -DAMCL_CURVE=$CURVE \
      -DWORD_SIZE=64 \
      $SCRIPTPATH && \
    emmake make -j $(getconf _NPROCESSORS_ONLN) VERBOSE=1)

name_0="wasm"
flags_0="-s WASM=1"
name_1="asmjs"
flags_1="-s WASM=0"

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
    -L$BUILDFOLDER/milagro-crypto-c/core -Wl,-rpath,$BUILDFOLDER/milagro-crypto-c/core \
    -rdynamic \
    $BUILDFOLDER/core/libgroupsign_$CURVE.a \
    $BUILDFOLDER/milagro-crypto-c/lib/libamcl_curve_$CURVE.a \
    $BUILDFOLDER/milagro-crypto-c/lib/libamcl_core.a \
    $BUILDFOLDER/milagro-crypto-c/lib/libamcl_pairing_$CURVE.a \
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
