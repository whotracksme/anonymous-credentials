#!/bin/bash

set -e
set -x

# Build the Milagro crypto library. Milagro uses a python script as its
# build system, found under "amcl/c/config64.py".
#
# Compilation steps in Milagro are hard-coded to use "gcc". That is why
# we patch it locally to allow compilation for different toolchains.
# In addition, there is an interactive configuration step that we want to
# need to automated.
(rm -rf $BUILDFOLDER && \
    mkdir -p $BUILDFOLDER && \
    cd $BUILDFOLDER && \
    cp $SCRIPTPATH/external/amcl/c/* . && \
    # WARNING: if this config64.py changes, double check the replacements still work
    echo "495a972a8833b6e3313ca50aafb2bfb70dfeed1f83c0d633042e3eb21df0ff32 config64.py" | sha256sum -c - && \
    sed -i "s/os.system(\"gcc/os.system(\"$CC $CFLAGS /g" config64.py && \
    sed -i "s/os.system(\"ar/os.system(\"$AR/g" config64.py && \
    # Note: this should be in sync with the CURVE choices that we want to support.
    # Select BN254 = 25 and 27 = BLS12383.
    # (These curves can be used by changing the CURVE file; more details can be found in the README).
    # Each choice needs to be separated by endline, and last one should be 0.
    echo -e "25\n27\n0" | python3 config64.py)

$CC $CFLAGS -D AMCL_CURVE_${CURVE} -c core/group-sign.c \
-I$BUILDFOLDER \
-o $BUILDFOLDER/group-sign.o
