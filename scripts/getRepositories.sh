#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

MODULES=$1
OUTPUT_FILE=$2

rm -f $OUTPUT_FILE
touch $OUTPUT_FILE

while IFS= read -r MODULE
do
	NPM_REPOSITORY=$(npm view $MODULE repository.url 2> /dev/null)
	RAW_NPM_REPOSITORY="github.com${NPM_REPOSITORY#*github.com}"
	if [ $RAW_NPM_REPOSITORY == "github.com" ]
	then	
		RAW_NPM_REPOSITORY=""
	fi
	
	echo "$MODULE,$RAW_NPM_REPOSITORY"
	
	echo "$MODULE,$RAW_NPM_REPOSITORY" >> $OUTPUT_FILE
done < "$MODULES"