# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

# Volume binding for standalone execution,
# Otherwise set by qbio/launch.sh
if [ ! $VOLUME ] || [ ! $DATADIR ]; then
    VOLUME='qbio'
    DATADIR='/'
fi

for dir in */ ; do
    container=qbio_${dir%*/}
    docker run -itd --name "$container" -v "$VOLUME":/qbio/ -v "$DATADIR":/qbio/data/ "$container" bash
done