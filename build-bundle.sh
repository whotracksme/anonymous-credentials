#!/bin/sh

npm install

(cd milagro-crypto-c && CMAKE_C_FLAGS='"-s WASM=1"' CMAKE_TOOLCHAIN_FILE=~/emsdk/emscripten/incoming/cmake/Modules/Platform/Emscripten.cmake make)

emcc -s WASM=1 -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2 -o group-sign-bindings.js  -L/home/alex/group-sign/milagro-crypto-c/target/default/src -Wl,-rpath,/home/alex/group-sign/milagro-crypto-c/target/default/src -rdynamic /home/alex/group-sign/milagro-crypto-c/target/default/src/libgroupsign.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_curve.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_core.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_pairing.a -s EXPORTED_FUNCTIONS="['_GS_seed', '_GS_createState', '_GS_setupGroup', '_GS_loadGroupPrivKey', '_GS_loadGroupPubKey', '_GS_startJoin', '_GS_finishJoin', '_GS_loadUserPrivKey', '_GS_exportGroupPrivKey', '_GS_exportGroupPubKey', '_GS_exportUserPrivKey', '_GS_processJoin', '_GS_sign', '_GS_verify', '_GS_getSignatureTag', '_GS_destroy']"

# Tweak the output js a little bit so that it exports a constructor function (perhaps not needed if you don't need to construct several instances...)
sed -i '1s;^;module.exports=function(){\n;' group-sign-bindings.js
echo "return Module;" >> group-sign-bindings.js
echo "}" >> group-sign-bindings.js

mkdir -p dist
echo "global.GroupSignManager = require('./group-signer');" | ./node_modules/.bin/browserify - > dist/group-signer-bundle.js
cp group-sign-bindings.wasm dist
