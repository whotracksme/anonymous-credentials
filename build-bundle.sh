#!/bin/sh

(cd milagro-crypto-c && make)

emcc -s WASM=1  -DCMAKE -I/home/alex/group-sign/milagro-crypto-c/target/default/src -I/home/alex/group-sign/milagro-crypto-c/target/default/include  -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2   -o  group-sign.c.o  -c group-sign.c


emcc -s WASM=1  -DCMAKE -I/home/alex/group-sign/milagro-crypto-c/target/default/src -I/home/alex/group-sign/milagro-crypto-c/target/default/include  -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2   -o  group-sign-bindings.c.o  -c group-sign-bindings.c

emcc -s WASM=1 -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2 group-sign.c.o group-sign-bindings.c.o -o group-sign-bindings.js  -L/home/alex/group-sign/milagro-crypto-c/target/default/src -Wl,-rpath,/home/alex/group-sign/milagro-crypto-c/target/default/src -rdynamic /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_ecc.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_curve.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_core.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_pairing.a

# We need to make the loader believe that the environment is node. We will then provide the
# necessary requires, also returning the wasm binary code from an inlined buffer
sed -i '1s;^;module.exports=function(){\n;' group-sign-bindings.js
echo "return Module;" >> group-sign-bindings.js
echo "}" >> group-sign-bindings.js

mkdir -p dist
echo "global.GroupSignManager = require('./group-sign-manager');" | ./node_modules/.bin/browserify - > dist/group-sign-worker-bundle.js
cp group-sign-bindings.wasm dist
