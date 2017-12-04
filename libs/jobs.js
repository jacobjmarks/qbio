const fs = require('fs');

const jobDir = "./jobs/";

fs.exists(jobDir, (exists) => {
    if (!exists) fs.mkdir(jobDir);
})

module.exports.create = (created_at, tool, file, cb) => {
    let job = {
        created_at: created_at,
        tool: tool,
        file: file,
        finished_at: null,
        error: false,
        results: null
    }

    fs.writeFile(jobDir + created_at + '.json', JSON.stringify(job), (err) => {
        if (err) return cb(new Error("Error storing job.\n" + err));
        cb();
    })
}

module.exports.getAll = (cb) => {
    fs.readdir(jobDir, (err, files) => {
        if (err) return cb(new Error("Error reading job directory.\n" + err));
        if (files.length == 0) return cb(null, []);
        
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

module.exports.update = (id, params) => {
    fs.readFile(jobDir + id + '.json', (err, data) => {
        if (err) return console.log("Error reading job file.\n" + err);
        let job = JSON.parse(data);
        job.finished_at = params.finished_at || job.finished_at;
        job.result = params.result || job.result;
        job.error = params.error || job.error;

        fs.writeFile(jobDir + id + '.json', JSON.stringify(job), (err) => {
            if (err) console.log("Error storing updated job.\n" + err);
        })
    })
}