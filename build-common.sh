#!/bin/bash

set -e
set -x

(rm -rf $BUILDFOLDER && \
    mkdir -p $BUILDFOLDER && \
    cd $BUILDFOLDER && \
    cp $SCRIPTPATH/external/amcl/version3/c/* . && \
    # WARNING: if this config64.py changes, double check the replacements still work
    echo "2eab9a13e9558d1fcaf5acf166ba62fd1d945df706743103cfd694c400e2a688 config64.py" | sha256sum -c - && \
    sed -i "s/os.system(\"gcc/os.system(\"$CC $CFLAGS /g" config64.py && \
    sed -i "s/os.system(\"ar/os.system(\"$AR/g" config64.py && \
    echo -e "18\n0" | python3 config64.py)

$CC $CFLAGS -D AMCL_CURVE_${CURVE} -c core/group-sign.c \
-I$BUILDFOLDER \
-o $BUILDFOLDER/group-sign.o