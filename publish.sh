#!/bin/bash

NAME=${1:-ui-test}
HOST=${2:-jmajesky@doppler.cs.umass.edu}
DST=${3:-/var/www/html/roost/}

FULLPATH=$DST/$NAME

ssh $HOST mkdir -p $FULLPATH
rsync -avz --no-t --include "index.html" --include "dist**" --include "data**" --exclude "*" --chmod=ug=rwX . $HOST:$FULLPATH/
