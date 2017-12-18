docker container stop qbio
docker container prune -f
docker build -t qbio .
docker run -it --rm --name qbio -p 80:3000 -v /var/run/:/var/run/ -v datavol:/qbio_data/ -v jobvol:/qbio_jobs/ qbio