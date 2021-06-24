#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
CURRENT_DIR="$(pwd)"

MODULES_WITH_GITHUB_REPO=$1

OUTPUT_DIRECTORY=$2

rm -rf $OUTPUT_DIRECTORY
mkdir $OUTPUT_DIRECTORY

N=10
while IFS=, read -r MODULE_NAME URL COMMIT_HASH
do
	(if [[ $URL == "" || $URL == "github.com/lodash/lodash.git" ]]
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
	fi) &

	# allow to execute up to $N jobs in parallel
    if [[ $(jobs -r -p | wc -l) -ge $N ]]; then
        wait -n
    fi

done < $MODULES_WITH_GITHUB_REPO

wait

# COUNT_EMPTY_DIRECTORIES=$(find $OUTPUT_DIRECTORY -type d -empty | wc -l | tr -d '[:space:]')
# echo "Cleaning empty directories: $COUNT_EMPTY_DIRECTORIES ..."

# find $OUTPUT_DIRECTORY -type d -empty -delete