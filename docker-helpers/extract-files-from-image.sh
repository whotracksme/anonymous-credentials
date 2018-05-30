#!/bin/bash
#
# Helper to extract a file from a docker image.
#
# Docker still does not support it natively, but you can create
# a temporary container and extract the file from there.
#

if [[ $# -lt 2 ]] ; then
    echo "Usage: OUTPUT_DIR DOCKER_IMAGE [FILES..]"
    exit 1
fi

readonly output_dir="$1"
readonly docker_image="$2"
shift 2

if [[ $# -eq 0 ]] ; then
    echo "List of files to extract is empty. Aborting..."
    exit 2
fi
readonly files="$@"

readonly container_id=$(docker create $docker_image)

mkdir -p -- "$output_dir"
for f in $files ; do
    echo "Copying $f"
    docker cp $container_id:$f "$output_dir/" || { echo "Failed to copy file: $f" ; exit 1 ; }
done
docker rm -v $container_id

echo
echo "Copied files to directory '$output_dir':"
for f in $files ; do
    echo "- $f"
done
