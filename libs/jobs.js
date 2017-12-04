const fs = require('fs');

const jobDir = "./jobs/";

fs.exists(jobDir, (exists) => {
    if (!exists) fs.mkdir(jobDir);
})

module.exports.create = (params, cb) => {
    fs.writeFile(jobDir + Date.now() + '.json', JSON.stringify(params), (err) => {
        if (err) return cb(new Error("Error storing job.\n" + err));
        cb();
    })
}

module.exports.getAll = (cb) => {
    fs.readdir(jobDir, (err, files) => {
        if (!files) console.log('no files');
        if (err) return cb(new Error("Error reading job directory.\n" + err));
        if (!files) return cb(null, []);
        
        let jobs = [];
        files.forEach((file) => {
            fs.readFile(jobDir + file, (err, data) => {
                if (err) return cb(new Error("Error reading job file.\n" + err));
                jobs.push(JSON.parse(data));
                if (jobs.length == files.length) {
                    cb(null, jobs);
                }
            })
        });
    })
}