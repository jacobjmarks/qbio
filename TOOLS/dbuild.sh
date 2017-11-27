# Move to script directory to use relative filepaths
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH

# Clean previous builds/runs
sh ./dclean.sh

# Tool A
docker build -t qbio-t_toola ./test/