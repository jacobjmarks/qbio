docker container stop qbio
docker container prune -f
docker rmi qbio
docker build -t qbio .
docker run -it --rm --name qbio -p 80:3000 -v /var/run/:/var/run/ -v datavol:/src/data/ -v jobvol:/src/jobs/ qbio