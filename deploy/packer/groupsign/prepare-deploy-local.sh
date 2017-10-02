#!/bin/bash
#
# Packages all files needed to run the group sign server
# in the file ./tmp-upload-dir/server.tgz
#

set -e

mkdir -p ./tmp-upload-dir
rm -rf ./tmp-upload-dir/*

# to determine the files needed to run the Node server,
# list all commited files in the "server" directory
readonly server_files=$(git ls-tree --full-tree --name-only -r HEAD server)
echo "(server) found the following files:"
for f in $server_files ; do
    echo "- $f"
done

readonly git_root_dir="${BASH_SOURCE%/*}/../../../"

( set -x && cd $git_root_dir && tar --create --gzip --verbose $server_files ) > ./tmp-upload-dir/server.tgz
( set -x && cd $git_root_dir/generated-server-deps/release && tar --create --gzip build node_modules ) > ./tmp-upload-dir/server-deps.tgz

printf "Updated files were successfully generated:\n$(du -hs ./tmp-upload-dir)\n"
