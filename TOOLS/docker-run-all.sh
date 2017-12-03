# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

for dir in */ ; do
    dir_trim=${dir%*/}
    container=qbio_$dir_trim
    docker run -itd --name "$container" -v datavol:/src/data/ "$container" bash
done