#!/bin/bash

SCRIPT_PATH="$(
    cd "$(dirname "$0")"
    pwd -P
)"

DEFINITELY_TYPED_REPO="https://github.com/DefinitelyTyped/DefinitelyTyped.git"
DEFINITELY_TYPED_FOLDER=$1
MODULES_FILE=$2

rm $MODULES_FILE

echo "Extracting modules ..."
for d in $DEFINITELY_TYPED_FOLDER/types/*; do
    echo $(basename $d),$(node $SCRIPT_PATH/../tools/getVersionFromDeclarationFileComment.js "$(head -n 1 $d/index.d.ts)") >> $MODULES_FILE
done

echo "Done"
echo ""
echo "Path to file:"
echo $MODULES_FILE
