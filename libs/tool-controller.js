const { exec } = require('child_process');
const conf = require('../conf.json');
const fs = require('fs');

const jobs = require('./jobs.js');

module.exports.process = (file, tool, cb) => {
    if (!file) return cb(new Error("Invalid datafile."));
    if (!tool) return cb(new Error("No tool specified."));

    let job = Date.now();

    try {
        this[tool](conf.dataDir + file, (err, result) => {
            // if (err) return cb(new Error("Internal tool error."));
            // jobs.update(job, {
            //     finished_at: Date.now(),
            //     result: result
            // });
        });
    } catch(err) {
        cb(new Error("Error creating child process.\n" + err));
    }

    jobs.create(job, tool, file, (err) => {
        if (err) return cb(new Error("Error creating job.\n" + err));
        cb(null);
    });
}

module.exports.bloom_filter = (file, cb) => {
    let cmd = ` \
        rm -f ${file}_queries* && \
        fsharpi executor.fsx --seqfile ${file} && \
        cat ${file}_queries* && \
        rm ${file}_queries* \
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