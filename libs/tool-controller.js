const { exec } = require('child_process');
const conf = require('../conf.json');
const fs = require('fs');
const path = require('path');

const jobs = require('./jobs.js');

const logPipe = (job) => {return `&>> ${conf.jobDir}${job}/log.txt`};

module.exports.process = (tool, files, settings, cb) => {
    if (!files) return cb(new Error("Invalid datafile."));
    if (!tool) return cb(new Error("No tool specified."));

    // Prepend all files with root data directory
    for (let file_group in files) {
        files[file_group] = files[file_group].map((file) => path.normalize(conf.dataDir + file));
    }

    let job = Date.now();

    try {
        this[tool](job, files, settings, (err, log) => {
            jobs.update(job, {
                finished_at: Date.now(),
                error: err
            });
        });
    } catch(err) {
        return cb(new Error("Error creating child process.\n" + err));
    }

    jobs.create(job, tool, null, (err) => {
        if (err) return cb(new Error("Error creating job.\n" + err));
        cb(null, job);
    });
}

module.exports.bigsi = (job, files, settings, cb) => {
    let log = logPipe(job);
    let cmd = `\
        rm -Rf /data/* && \
        echo 'PREPARING DATA...' ${log} && \
        ${(() => {
            let mccortex_builds = [];
            files['files'].forEach((file, index) => {
                mccortex_builds.push(`mccortex/bin/mccortex31 build -k ${settings['kmer-size']} -s ${index} -1 ${file} /data/${index}.ctx ${log}`);
            })
            return mccortex_builds.join(' && ');
        })()} && \
        echo 'CONSTRUCTING BLOOM FILTERS...' ${log} && \
        bigsi init /data/temp.bigsi --k ${settings['kmer-size']} --m ${settings['m']} --h ${settings['h']} ${log} && \
        ${(() => {
            let bigsi_blooms = [];
            files['files'].forEach((file, index) => {
                bigsi_blooms.push(`bigsi bloom --db /data/temp.bigsi -c /data/${index}.ctx /data/${index}.bloom ${log}`);
            })
            return bigsi_blooms.join(' && ');
        })()} && \ 
        echo 'BUILDING COMBINED GRAPH...' ${log} && \
        bigsi build /data/temp.bigsi \
            ${(() => {
                let bloom_files = [];
                files['files'].forEach((file, index) => {
                    bloom_files.push(`/data/${index}.bloom`)
                })
                return bloom_files.join(' ');
            })()} ${log} && \
        echo 'QUERYING...' ${log} && \
        bigsi search --db /data/temp.bigsi -s ${settings['query-seq']} \
            > ${conf.jobDir}${job}/result.txt && \
        ls -al /data/ ${log} && \
        rm -Rf /data/* \
    `;

    docker_exec("qbio_bigsi", cmd, (err) => cb(err));
}

module.exports.bloom_filter = (job, files, settings, cb) => {
    let file = files['file'][0];

    let log = logPipe(job);
    let cmd = ` \
        rm -f ${file}*queries* && \
        rm -f ${file}*chart* && \
        fsharpi executor.fsx \
            --seqfile ${file} \
            --blocksize ${settings['block-size']} \
            --k ${settings['kmer-size']} \
            --m ${settings['filter-size']} \
            --f ${settings['hash-functions']} \
            --threshold ${settings['kmer-threshold']} \
            --comparekmers true \
            ${log} && \
        mv ${file}*queries* ${conf.jobDir}${job}/result.txt && \
        mv ${file}*chart* ${conf.jobDir}${job}/chart.html \
    `;

    docker_exec("qbio_bloom-filter", cmd, (err) => cb(err));
}

function docker_exec(container, command, cb) {
    exec(`docker exec ${container} bash -c "${command}"`, (error, stdout, stderr) => {
        cb(error && error.message);
    })
}