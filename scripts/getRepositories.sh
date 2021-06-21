#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

MODULES=$1
OUTPUT_FILE=$2

rm -f $OUTPUT_FILE
touch $OUTPUT_FILE

while IFS=, read -r MODULE VERSION
do
	NPM_REPOSITORY=$(npm view $MODULE repository.url 2> /dev/null)
	GITHUB_REPOSITORY="github.com${NPM_REPOSITORY#*github.com}"
	COMMIT_HASH=""
	if [ $GITHUB_REPOSITORY == "github.com" ]
	then	
		GITHUB_REPOSITORY=""
	fi

	if [[ $GITHUB_REPOSITORY != "" && $VERSION != "" ]]
	then
		COMMIT_HASH=$(node $SCRIPT_PATH/../tools/getCommitHashFromVersion.js $GITHUB_REPOSITORY $MODULE $VERSION)
		# node $SCRIPT_PATH/../tools/getCommitHashFromVersion.js $GITHUB_REPOSITORY $MODULE $VERSION
	fi
	
	echo "$MODULE,$GITHUB_REPOSITORY,$COMMIT_HASH"
	
	echo "$MODULE,$GITHUB_REPOSITORY,$COMMIT_HASH" >> $OUTPUT_FILE
done < "$MODULES"