#!/bin/bash

set -e
set -x

BUILDFOLDER=embuild
DISTFOLDER=dist

EMSCRIPTEN_PATH=${EMSCRIPTEN_PATH:-~/emsdk}

if [ ! -f "$EMSCRIPTEN_PATH/emsdk_env.sh" ]; then
    echo "emscripten installation not found" ;
    exit 1 ;
fi

. "$EMSCRIPTEN_PATH/emsdk_env.sh"

if [ -z "$BUILD_TYPE" ]
then
  . ./config.release
fi

( rm -rf $BUILDFOLDER && mkdir $BUILDFOLDER && \
    cd $BUILDFOLDER && \
    emcmake cmake \
      -DENABLE_TESTS=$ENABLE_TESTS \
      -DCMAKE_C_FLAGS="$CFLAGS" \
      -DCMAKE_CXX_FLAGS="$CXXFLAGS" \
      -DCMAKE_BUILD_TYPE=$BUILD_TYPE \
      -DBUILD_SHARED_LIBS=OFF \
      -DAMCL_CURVE=BN254 \
      ../core && \
    emmake make VERBOSE=1)

name_0="wasm"
flags_0="-s WASM=1"
name_1="asmjs"
flags_1="-s WASM=0"

for emidx in 0 1
do
EMNAME="name_$emidx"
EMNAME=${!EMNAME}
EMFLAGS="flags_$emidx"
EMFLAGS=${!EMFLAGS}

( mkdir -p "$(pwd)/$DISTFOLDER" && \
  emcc ${EMFLAGS} \
    --pre-js pre.js \
    -s SINGLE_FILE=1 \
    -s NO_EXIT_RUNTIME=1 \
    -s ASSERTIONS=$EMCC_ASSERTIONS \
    $EMCC_FLAGS \
    -std=c11 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align \
    -Wunused-variable -Wundef -Wformat-security -Wshadow \
    -o "$(pwd)/$DISTFOLDER/group-sign-$EMNAME.js" \
    -L$(pwd)/$BUILDFOLDER/milagro-crypto-c/src -Wl,-rpath,$(pwd)/$BUILDFOLDER/milagro-crypto-c/src \
    -rdynamic \
    $(pwd)/$BUILDFOLDER/src/libgroupsign.a \
    $(pwd)/$BUILDFOLDER/milagro-crypto-c/lib/libamcl_curve_BN254.a \
    $(pwd)/$BUILDFOLDER/milagro-crypto-c/lib/libamcl_core.a \
    $(pwd)/$BUILDFOLDER/milagro-crypto-c/lib/libamcl_pairing_BN254.a \
    -s EXPORTED_FUNCTIONS="[\
       '_GS_seed', \
       '_GS_createState', \
       '_GS_setupGroup', \
       '_GS_loadGroupPrivKey', \
       '_GS_loadGroupPubKey', \
       '_GS_startJoin', \
       '_GS_finishJoin', \
       '_GS_loadUserPrivKey', \
       '_GS_exportGroupPrivKey', \
       '_GS_exportGroupPubKey', \
       '_GS_exportUserPrivKey', \
       '_GS_processJoin', \
       '_GS_sign', \
       '_GS_verify', \
       '_GS_getSignatureTag', \
       '_GS_destroyState', \
       '_GS_startJoinStatic', \
       '_GS_finishJoinStatic', \
       '_GS_getStateSize' \
       ]" \
)
done
