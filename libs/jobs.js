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
        log: null
    }

    fs.mkdir(jobDir + created_at, (err) => {
        if (err) return cb(new Error("Error creating job.\n" + err));
        fs.writeFile(jobDir + created_at + '/meta.json', JSON.stringify(job), (err) => {
            if (err) return cb(new Error("Error storing job.\n" + err));
            cb();
        })
    })
}

module.exports.get = (id, cb) => {
    fs.readFile(jobDir + id + '/meta.json', (err, meta) => {
        if (err) return cb(new Error("Error reading job file.\n" + err));
        fs.readFile(jobDir + id + '/result.txt', (err, result) => {
            cb(null, {
                meta: JSON.parse(meta),
                result: result ? result.toString() : "Error"
            });
        })
    })
}

module.exports.stats = (cb) => {
    fs.readdir(jobDir, (err, files) => {
        if (err) return cb(new Error("Error reading job directory.\n" + err));
        if (files.length == 0) return cb(null, []);
        
        let jobs = [];
        files.forEach((id) => {
            fs.readFile(jobDir + id + '/meta.json', (err, data) => {
                if (err) return cb(new Error("Error reading job file.\n" + err));
                let job = JSON.parse(data);
                job.error = job.error ? true : false;
                job.log = null;
                jobs.push(job);
                if (jobs.length == files.length) {
                    cb(null, jobs);
                }
            })
        });
    })
}

module.exports.update = (id, params) => {
    fs.readFile(jobDir + id + '/meta.json', (err, data) => {
        if (err) return console.log("Error reading job file.\n" + err);
        let job = JSON.parse(data);
        job.finished_at = params.finished_at || job.finished_at;
        job.log = params.log || job.log;
        job.error = params.error || job.error;

        fs.writeFile(jobDir + id + '/meta.json', JSON.stringify(job), (err) => {
            if (err) console.log("Error storing updated job.\n" + err);
        })
    })
}