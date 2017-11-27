docker container stop $(docker ps -q -f NAME=qbio-t)
docker container prune -f
docker image remove $(docker images -q -f REFERENCE=qbio-t*)