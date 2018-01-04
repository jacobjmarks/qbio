# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

# CONFIGURATION ------------------------------------
# Volume binding. Full paths required.
SERVERPORT=80
VOLUME='qbio'
DATADIR='/'
# --------------------------------------------------

docker container stop qbio
docker container prune -f
docker build -t qbio .

docker run -it --rm --name qbio \
    -p $SERVERPORT:3000 \
    -v /var/run/:/var/run/ \
    -v "$VOLUME":/qbio/ \
    -v "$DATADIR":/qbio/data/ \
    -e VOLUME="$VOLUME" \
    -e DATADIR="$DATADIR" \
    qbio