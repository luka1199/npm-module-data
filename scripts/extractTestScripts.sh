#!/bin/bash

SCRIPT_PATH="$(
    cd "$(dirname "$0")"
    pwd -P
)"

PACKAGE_FILES=$1
OUTPUT_FILE=$2

rm -f $OUTPUT_FILE

for FILE in $PACKAGE_FILES/*/package.json; do (
    echo "$(basename $(dirname $FILE)),\"$(node $SCRIPT_PATH/../tools/testScriptParser.js $FILE)\""
    echo "$(basename $(dirname $FILE)),\"$(node $SCRIPT_PATH/../tools/testScriptParser.js $FILE)\"" >>$OUTPUT_FILE
) & done
