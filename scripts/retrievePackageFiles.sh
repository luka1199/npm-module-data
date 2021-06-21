#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"

MODULES_WITH_GITHUB_REPO=$1

OUTPUT_DIRECTORY=$2

rm -rf $OUTPUT_DIRECTORY
mkdir $OUTPUT_DIRECTORY

while IFS=, read -r moduleName repo commitHash
do	
	if [[ $repo == "" ]]
	then	
		continue
	fi
    echo "Exctracting package.json file for module: $moduleName | $repo | $commitHash"
	if [[ $commitHash == "" ]]
	then	
		commitHash=$(git remote show https://${repo} | grep 'HEAD branch' | cut -d' ' -f5)
	fi
	RAW_GITHUB_URL_FRONT_URL="https://raw.githubusercontent.com"
	RAW_GITHUB_URL=${repo/github.com/$RAW_GITHUB_URL_FRONT_URL}

	RAW_GITHUB_URL=${RAW_GITHUB_URL%".git"}
	RAW_GITHUB_URL="${RAW_GITHUB_URL}/$commitHash"

	OUTPUT_DIRECTORY_MODULE=$OUTPUT_DIRECTORY/"${moduleName/"/"/"-"}"

	mkdir $OUTPUT_DIRECTORY_MODULE
	CURL=$(curl -L -o $OUTPUT_DIRECTORY_MODULE/package.json --fail $RAW_GITHUB_URL/package.json 2>&1 > /dev/null)


done < $MODULES_WITH_GITHUB_REPO

COUNT_EMPTY_DIRECTORIES=$(find $OUTPUT_DIRECTORY -type d -empty | wc -l | tr -d '[:space:]')
echo "Cleaning empty directories: $COUNT_EMPTY_DIRECTORIES ..."

find $OUTPUT_DIRECTORY -type d -empty -delete