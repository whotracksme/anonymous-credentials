#!/bin/bash

set -e

print_help() {
    echo "Usage: ./build.sh --target=[dev|stage|prod] SERVICE_DIR"
}

# Fail fast if dependencies of the bash script are missing.
(envsubst  <> /dev/null
 packer     > /dev/null
 git        > /dev/null
 terraform  > /dev/null
 terragrunt > /dev/null
) || (echo "Missing dependencies. Aborting..." && exit 1)

# make sure we are in the directory which contains the "build.sh" script
cd "${BASH_SOURCE%/*}"

# TODO: switch to getop
if ! [[ $# -eq 2 ]]; then
    print_help
    exit 1
fi
if [[ $1 == "--target=dev" ]]; then
    readonly target="dev"
elif [[ $1 == "--target=stage" ]]; then
    readonly target="stage"
elif [[ $1 == "--target=prod" ]]; then
    readonly target="prod"
else
    print_help
    exit 1
fi
    
readonly service=$2

readonly tag_commit=$(git rev-parse HEAD)
readonly tag_branch=$(git rev-parse --abbrev-ref HEAD)

echo "*** Clean previous deployment leftovers ***"
(cd ../.. && make clean-deploy)

if [[ $service == "groupsign" ]]; then
    echo "*** Building dependencies from $service ***"
    (cd ../.. && make build-server-deps)

    # This is a workaround, maybe there is a better solution.
    # At the start, Packer verifies that all upload sources exists.
    # When files are generated as part of the build, this will fail.
    #
    # As a workaround, make sure that the directory exists before
    # continuing. (As we have called clean before, the directory
    # will not exist.)
    mkdir groupsign/tmp-upload-dir
fi

echo "*** Building AMI for service $service ***"

readonly debug_packer=""
#readonly debug_packer="-debug" # makes packer stop after each command

packer_out=$(
    set -x &&
    cd "$service" &&
    packer build $debug_packer \
           -var-file=../common_vars.json \
           -var-file=../common_vars_test.json \
	   -var "tag_commit=$tag_commit" \
	   -var "tag_branch=$tag_branch" \
           packer.json | tee /dev/tty
)

# packer prints the id of the generated AMI in its last line
ami=$(echo "$packer_out" | tail -c 30 | perl -n -e'/: (ami-.+)$/ && print $1')

if [[ -z $ami ]]; then
    echo "ERROR: Failed to extract the image id from packer output."
    exit 1
fi

echo "*** Packer finished. The generated AMI is called $ami ***"
(
    set -x &&
    cd ../terraform/live/${target}/services/${service} &&
    export AMI_GENERATED_BY_PACKER="$ami" &&
    envsubst < ami.tf.template > ami.tf &&
    ( ( terragrunt get -update &&
        terragrunt validate &&
        echo "Successfully updated Terraform setup of service ${service}."
      ) || echo "WARN: Validation errors after updating the Terraform setup of service ${service}"
    )
)
