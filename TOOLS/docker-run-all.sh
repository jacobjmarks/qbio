# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

# Volume binding for local development
# Otherwise set by qbio/launch.sh
if [ ! $DATADIR ] || [ ! $JOBDIR ]; then
    DATADIR='datavol'
    JOBDIR='jobvol'
fi

for dir in */ ; do
    container=qbio_${dir%*/}
    docker run -itd --name "$container" -v "$DATADIR":/qbio_data/ -v "$JOBDIR":/qbio_jobs/ "$container" bash
done