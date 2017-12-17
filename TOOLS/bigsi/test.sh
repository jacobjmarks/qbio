docker exec qbio_bigsi bash -c '\
    rm -Rf /data/* && \
    echo "PREPARING DATA" && \
    mccortex/bin/mccortex31 build -k 3 -s test1 -1 /qbio_data/sequences.fna /data/test1.ctx && \
    echo "CONSTRUCTING BLOOM FILTERS" && \
    bigsi init /data/test.bigsi --k 3 --m 1000 --h 1 && \
    bigsi bloom --db /data/test.bigsi -c /data/test1.ctx /data/test1.bloom && \
    echo "BUILDING COMBINED GRAPH" && \
    bigsi build /data/test.bigsi /data/test1.bloom && \
    echo "QUERYING" && \
    bigsi search --db /data/test.bigsi -s ACTG && \
    rm -Rf /data/* \
'