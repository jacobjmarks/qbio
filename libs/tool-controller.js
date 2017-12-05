const { exec } = require('child_process');
const conf = require('../conf.json');
const fs = require('fs');

const jobs = require('./jobs.js');

module.exports.process = (file, tool, cb) => {
    if (!file) return cb(new Error("Invalid datafile."));
    if (!tool) return cb(new Error("No tool specified."));

    let job = Date.now();

    try {
        this[tool](job, conf.dataDir + file, (err, result) => {
            console.log("DONE");
            jobs.update(job, {
                finished_at: Date.now(),
                error: err,
                result: result
            });
        });
    } catch(err) {
        cb(new Error("Error creating child process.\n" + err));
    }

    jobs.create(job, tool, file, (err) => {
        if (err) return cb(new Error("Error creating job.\n" + err));
        cb(null);
    });
}

module.exports.bloom_filter = (job, file, cb) => {
    let cmd = ` \
        rm -f ${file}_queries* && \
        fsharpi executor.fsx --seqfile ${file} && \
        mv ${file}_queries* ./jobs/${job}/result.txt \
    `;

    docker_exec("qbio_bloom-filter", cmd, (err, result) => {
        if (err) return cb(true);
        cb(null, result);
    })
}

function docker_exec(container, command, cb) {
    exec(`docker exec ${container} bash -c "${command}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return cb(true);
        }
        cb(null, stdout);
    })
}