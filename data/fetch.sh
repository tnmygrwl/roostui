#!/bin/bash

NAME=${1:-all_stations_v3}
SRC=${2:-swarm.cs.umass.edu:/mnt/nfs/scratch1/wenlongzhao/roosts_data}
echo "name is $NAME"
rsync -avz $SRC/$NAME/ui/scans_and_tracks/ $NAME/
