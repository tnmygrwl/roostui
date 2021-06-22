#!/bin/bash

usage () {
    echo >&2 "$@"
    echo >&2 "$0 <dataset_name> [prefix] [suffix]"
    echo >&2 ""
    echo >&2 "creates list of batches by listing all files with given prefix"
    echo >&2 "and suffix and stripping prefix/suffix"
    exit 1
}

[ "$#" -ge 1 ] || usage "first argument required"

DATASET=$1
PREFIX=${2:-"scans_"}
SUFFIX=${3:-".txt"}

cp default/config.json $DATASET/
pushd $DATASET >/dev/null
ls $PREFIX*$SUFFIX | sed -e "s/^$PREFIX//" -e "s/$SUFFIX\$//" > batches.txt
popd >/dev/null
