#!/bin/bash

set -e
set -x

# Build the Milagro crypto library. Milagro uses a python script as its
# build system, found under "amcl/version3/c/config.py".
#
# Compilation steps in Milagro are hard-coded to use "gcc". That is why
# we patch it locally to allow compilation for different toolchains.
# In addition, there is an interactive configuration step that we want to
# need to automated.
(rm -rf $BUILDFOLDER && \
    mkdir -p $BUILDFOLDER && \
    cd $BUILDFOLDER && \
    cp $SCRIPTPATH/external/amcl/version3/c/* . && \
    # WARNING: if this config64.py changes, double check the replacements still work
    echo "2eab9a13e9558d1fcaf5acf166ba62fd1d945df706743103cfd694c400e2a688 config64.py" | sha256sum -c - && \
    sed -i "s/os.system(\"gcc/os.system(\"$CC $CFLAGS /g" config64.py && \
    sed -i "s/os.system(\"ar/os.system(\"$AR/g" config64.py && \
    # Note: this should be in sync with the CURVE choices that we want to support.
    # Select BN254 = 18 and 20 = BLS383.
    # (These curves can be used by changing the CURVE file; more details can be found in the README).
    # Each choice needs to be separated by endline, and last one should be 0.
    echo -e "18\n20\n0" | python3 config64.py)

$CC $CFLAGS -D AMCL_CURVE_${CURVE} -c core/group-sign.c \
-I$BUILDFOLDER \
-o $BUILDFOLDER/group-sign.o
