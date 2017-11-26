const { exec } = require('child_process');

module.exports.process = (file, cb) => {
    exec(`docker exec toolA bash -c "python test.py '${file}'"`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return cb(true);
        }
        cb(null, stdout);
    })
}