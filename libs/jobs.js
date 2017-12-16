const fs = require('fs');
const conf = require('../conf.json');
const rimraf = require('rimraf');

fs.exists(conf.jobDir, (exists) => {
    if (!exists) fs.mkdir(conf.jobDir);
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

    fs.mkdir(conf.jobDir + created_at, (err) => {
        if (err) return cb(new Error("Error creating job.\n" + err));
        fs.writeFile(conf.jobDir + created_at + '/meta.json', JSON.stringify(job), (err) => {
            if (err) return cb(new Error("Error storing job.\n" + err));
            cb();
        })
    })
}

module.exports.delete = (id, cb) => {
    rimraf(conf.jobDir + id, (err) => {
        if (err) return cb(err);
        cb();
    })
}

module.exports.get = (id, cb) => {
    fs.readFile(conf.jobDir + id + '/meta.json', (err, meta) => {
        if (err) return cb(new Error("Error reading job file.\n" + err));
        fs.readFile(conf.jobDir + id + '/result.txt', (err, result) => {
            cb(null, {
                meta: JSON.parse(meta),
                result: ((result) => {
                    if (!result) return;
                    result = result.toString();
                    if (result.length > 5000) {
                        return result.substring(0, 5000) + " [DOWNLOAD TO VIEW MORE]"
                    }
                    return result;
                })(result)
            });
        })
    })
}

module.exports.chart = (id, cb) => {
    fs.readFile(conf.jobDir + id + '/chart.html', (err, data) => {
        cb(err, data);
    })
}

module.exports.stats = (cb) => {
    fs.readdir(conf.jobDir, (err, files) => {
        if (err) return cb(new Error("Error reading job directory.\n" + err));
        if (files.length == 0) return cb(null, []);
        
        let jobs = [];
        files.forEach((id) => {
            fs.readFile(conf.jobDir + id + '/meta.json', (err, data) => {
                if (err) return cb(new Error("Error reading job file.\n" + err));
                let job = JSON.parse(data);
                job.error = job.error ? true : false;
                job.log = null;
                jobs.push(job);
                if (jobs.length == files.length) {
                    jobs.sort((a, b) => a.created_at > b.created_at);
                    cb(null, jobs);
                }
            })
        });
    })
}

module.exports.update = (id, params) => {
    fs.readFile(conf.jobDir + id + '/meta.json', (err, data) => {
        if (err) return console.log("Error reading job file.\n" + err);
        let job = JSON.parse(data);
        job.finished_at = params.finished_at || job.finished_at;
        job.log = params.log || job.log;
        job.error = params.error || job.error;

        fs.writeFile(conf.jobDir + id + '/meta.json', JSON.stringify(job), (err) => {
            if (err) console.log("Error storing updated job.\n" + err);
        })
    })
}