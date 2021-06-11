#!/bin/bash

NAME=${1:-test}
SRC=${2:-swarm2:/mnt/nfs/scratch1/wenlongzhao/roosts_data}

echo "name is $NAME"
rsync -avz $SRC/$NAME/ui/scans_and_tracks/ $NAME/
