const { exec, fork } = require('child_process');
const conf = require('../conf.json');
const fs = require('fs');

module.exports.process = (file, tool, cb) => {
    if (!file) return cb(new Error("Invalid datafile."));
    if (!tool) return cb(new Error("No tool specified."));

    try {
        this[tool](conf.dataDir + file, (err, result) => {
            if (err) return cb(new Error("Internal tool error."));
            cb(null, result);
        });
    } catch(err) {
        cb(new Error("Error creating child process.\n" + err));
    }
}

module.exports.test = (file, cb) => {
    exec(`docker exec qbio_test bash -c "python test.py '${file}'"`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return cb(true);
        }
        cb(null, stdout);
    })
}

module.exports.bloom_filter = (file, cb) => {
    exec(`docker exec qbio_bloom-filter bash -c "rm -f ${file}_queries* && fsharpi executor.fsx --seqfile ${file} && cat ${file}_queries* && rm ${file}_queries*"`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return cb(true);
        }
        cb(null, stdout);
    })
}