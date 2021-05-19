#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

PACKAGE_FILES=$1

for FILE in $PACKAGE_FILES/*/package.json;
do
    echo $(basename $(dirname $FILE)), $(jq .scripts.test $FILE)
done