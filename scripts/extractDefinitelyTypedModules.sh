#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

DEFINITELY_TYPED_REPO="https://github.com/DefinitelyTyped/DefinitelyTyped.git"
DEFINITELY_TYPED_FOLDER=$1
MODULES_FILE=$2

echo "Extracting modules ..."
ls $DEFINITELY_TYPED_FOLDER/types > $MODULES_FILE

echo "Done"
echo ""
echo "Path to file:"
echo $MODULES_FILE