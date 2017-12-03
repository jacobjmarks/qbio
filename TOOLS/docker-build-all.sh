# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH
# --------------------------------------------------

sh ./docker-clean.sh

for dir in */ ; do
    docker build -t "qbio_${dir%*/}" $dir
done