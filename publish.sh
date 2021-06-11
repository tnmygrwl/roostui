#!/bin/bash

NAME=${1:-test}
HOST=${2:-doppler.cs.umass.edu}
DST=${3:-/var/www/html/roost/}

FULLPATH=$DST/$NAME

ssh $HOST mkdir -p $FULLPATH

echo "name is $NAME"
rsync -avz index.html $HOST:$FULLPATH/
rsync -avz dist $HOST:$FULLPATH/
rsync -avz data $HOST:$FULLPATH/
