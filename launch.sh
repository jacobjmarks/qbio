# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

# CONFIGURATION ------------------------------------
# Volume binding. Full paths required.
DATADIR='datavol'
JOBDIR='jobvol'
# --------------------------------------------------

docker container stop qbio
docker container prune -f
docker build -t qbio .

docker run -it --rm --name qbio \
    -p 80:3000 \
    -v /var/run/:/var/run/ \
    -v "$DATADIR":/qbio_data/ \
    -v "$JOBDIR":/qbio_jobs/ \
    -e DATADIR="$DATADIR" \
    -e JOBDIR="$JOBDIR" \
    qbio