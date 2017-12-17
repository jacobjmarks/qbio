const { exec } = require('child_process');
const conf = require('../conf.json');
const fs = require('fs');

const jobs = require('./jobs.js');

module.exports.process = (file, tool, settings, cb) => {
    if (!file) return cb(new Error("Invalid datafile."));
    if (!tool) return cb(new Error("No tool specified."));

    let job = Date.now();

    try {
        this[tool](job, conf.dataDir + file, settings, (err, log) => {
            jobs.update(job, {
                finished_at: Date.now(),
                error: err,
                log: log
            });
        });
    } catch(err) {
        return cb(new Error("Error creating child process.\n" + err));
    }

    jobs.create(job, tool, file, (err) => {
        if (err) return cb(new Error("Error creating job.\n" + err));
        cb(null, job);
    });
}

module.exports.bigsi = (job, file, settings, cb) => {

    docker_exec("qbio_bigsi", cmd, (err, log) => cb(err, log));
}

module.exports.bloom_filter = (job, file, settings, cb) => {
    let cmd = ` \
        rm -f ${file}*queries* && \
        rm -f ${file}*chart* && \
        fsharpi executor.fsx \
            --seqfile ${file} \
            --blocksize ${settings['block-size']} \
            --k ${settings['kmer-size']} \
            --m ${settings['filter-size']} \
            --f ${settings['hash-functions']} \
            --comparekmers ${settings['compare-kmers'] == 1 ? "true" : "false"} && \
        mv ${file}*queries* ${conf.jobDir}${job}/result.txt && \
        mv ${file}*chart* ${conf.jobDir}${job}/chart.html \
    `;

    docker_exec("qbio_bloom-filter", cmd, (err, log) => cb(err, log));
}

function docker_exec(container, command, cb) {
    exec(`docker exec ${container} bash -c "${command}"`, (error, stdout, stderr) => {
        cb(error && error.message, stdout || stderr);
    })
}