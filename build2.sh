emcc -s WASM=1  -DCMAKE -I/home/alex/group-sign/milagro-crypto-c/target/default/src -I/home/alex/group-sign/milagro-crypto-c/target/default/include  -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2   -o  group-sign.c.o  -c group-sign.c


emcc -s WASM=1  -DCMAKE -I/home/alex/group-sign/milagro-crypto-c/target/default/src -I/home/alex/group-sign/milagro-crypto-c/target/default/include  -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2   -o  interface.c.o  -c interface.c

emcc -s WASM=1 -std=c99 -Wall -Wextra -Wno-strict-prototypes -Wunused-value -Wcast-align -Wunused-variable -Wundef -Wformat-security -Wshadow -O2 group-sign.c.o interface.c.o -o interface.js  -L/home/alex/group-sign/milagro-crypto-c/target/default/src -Wl,-rpath,/home/alex/group-sign/milagro-crypto-c/target/default/src -rdynamic /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_ecc.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_curve.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_core.a /home/alex/group-sign/milagro-crypto-c/target/default/src/libamcl_pairing.a

sed -i '1s;^;module.exports=function(module){\n;' interface.js
# awk '{print "module.exports=function(module){" $0}' interface.js
# echo -e "module.exports=function(module){\n$(cat interface.js)\n}" > interface.js
echo "}" >> interface.js
