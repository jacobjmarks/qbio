# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

for dir in */ ; do
    container=qbio_${dir%*/}
    docker run -itd --name "$container" -v datavol:/qbio_data/ -v jobvol:/qbio_jobs/ "$container" bash
done