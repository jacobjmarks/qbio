docker container stop $(docker ps -q -f NAME=qbio_)
docker container prune -f
docker image remove $(docker images | grep -o 'qbio_[^ ]*')