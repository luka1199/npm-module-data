#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
CURRENT_DIR="$(pwd)"

MODULES_WITH_GITHUB_REPO=$1

OUTPUT_DIRECTORY=$2

rm -rf $OUTPUT_DIRECTORY
mkdir $OUTPUT_DIRECTORY

while IFS=, read -r MODULE_NAME URL COMMIT_HASH
do
	if [[ $URL == "" ]]
	then	
        continue
	fi
    echo ""
    echo ">> $MODULE_NAME: URL: $URL, Commit hash: $commitHash"
    git clone "https://$URL" "$OUTPUT_DIRECTORY/$MODULE_NAME/src"

	if [[ ! $COMMIT_HASH == "" ]]
	then	
		cd "$OUTPUT_DIRECTORY/$MODULE_NAME/src"
        git checkout $COMMIT_HASH
		cd $CURRENT_DIR
	fi

done < $MODULES_WITH_GITHUB_REPO

# COUNT_EMPTY_DIRECTORIES=$(find $OUTPUT_DIRECTORY -type d -empty | wc -l | tr -d '[:space:]')
# echo "Cleaning empty directories: $COUNT_EMPTY_DIRECTORIES ..."

# find $OUTPUT_DIRECTORY -type d -empty -delete