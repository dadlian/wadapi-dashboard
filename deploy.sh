#!/bin/bash

declare -r EXCLUDES=$(dirname $BASH_SOURCE)/exclude.txt
declare -r REPO_ROOT=$(dirname $BASH_SOURCE)

if [ "$1" = "dev" ]; then
	declare -r TARGET_DIR=/var/www/html/wadapi-dashboard/
elif [ "$1" = "prod" ]; then
	declare -r TARGET_DIR=wadapi@mywadapi.com:/home/wadapi/dashboard/
else
	echo "Please specify one of [dev/prod] as deploy target"
	exit
fi

if [ "$2" = "go" ];then
	cp $REPO_ROOT/js/services/constants.$1.js $REPO_ROOT/js/services/constants.js
	rsync -rltzuv --itemize-changes --delete -O --exclude-from $EXCLUDES $REPO_ROOT $TARGET_DIR
else
	rsync -rltzuv --itemize-changes --delete -O --dry-run --exclude-from $EXCLUDES $REPO_ROOT $TARGET_DIR
fi
