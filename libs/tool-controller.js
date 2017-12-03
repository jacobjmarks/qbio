const { exec } = require('child_process');
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
        cb(new Error("Invalid tool."));
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