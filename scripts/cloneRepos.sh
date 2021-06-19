#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

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

	if [[ $COMMIT_HASH == "" ]]
	then	
        git --git-dir="$OUTPUT_DIRECTORY/$MODULE_NAME/src/.git" checkout $COMMIT_HASH
	fi

done < $MODULES_WITH_GITHUB_REPO

# COUNT_EMPTY_DIRECTORIES=$(find $OUTPUT_DIRECTORY -type d -empty | wc -l | tr -d '[:space:]')
# echo "Cleaning empty directories: $COUNT_EMPTY_DIRECTORIES ..."

# find $OUTPUT_DIRECTORY -type d -empty -delete