#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

MODULES=$1
OUTPUT_FILE=$2

rm -f $OUTPUT_FILE
touch $OUTPUT_FILE

while IFS= read -r MODULE VERSION
do
	NPM_REPOSITORY=$(npm view $MODULE repository.url 2> /dev/null)
	RAW_NPM_REPOSITORY="github.com${NPM_REPOSITORY#*github.com}"
	COMMIT_HASH=""
	if [ $RAW_NPM_REPOSITORY == "github.com" ]
	then	
		RAW_NPM_REPOSITORY=""
	fi

	if [ $RAW_NPM_REPOSITORY != "" && $VERSION != ""]
	then
		COMMIT_HASH=$($SCRIPT_PATH/../tools/getCommitHashFromVersion.js $RAW_NPM_REPOSITORY $MODULE $VERSION)
	fi
	
	echo "$MODULE,$RAW_NPM_REPOSITORY,$COMMIT_HASH"
	
	echo "$MODULE,$RAW_NPM_REPOSITORY,$COMMIT_HASH" >> $OUTPUT_FILE
done < "$MODULES"