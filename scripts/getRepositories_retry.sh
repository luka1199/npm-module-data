#!/bin/bash

SCRIPT_PATH="$(
	cd "$(dirname "$0")"
	pwd -P
)"

MODULES=$1
MODULES_WITH_REPO_FILE=$2
OUTPUT_FILE=$3

rm -f $OUTPUT_FILE
touch $OUTPUT_FILE

COUNTER=0
while IFS=, read -r MODULE URL HASH; do
	let COUNTER++
	if [[ $URL != "" && $HASH == "" ]]; then
		IFS=, read -r MODULE_2 VERSION <<<$(head -n $COUNTER $MODULES | tail -1)
		if [[ $VERSION != "" ]]; then
			echo "$MODULE,$URL,$HASH,$VERSION"
			HASH=$(node $SCRIPT_PATH/../tools/getCommitHashFromVersion.js $URL $MODULE $VERSION)
			echo $HASH
			# echo "$(node $SCRIPT_PATH/../tools/getCommitHashFromVersion.js $URL $MODULE $VERSION)"
		fi
	fi

	echo "$MODULE,$URL,$HASH" >> $OUTPUT_FILE
done <"$MODULES_WITH_REPO_FILE"
