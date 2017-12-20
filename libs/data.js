const fs = require('fs');
const path = require('path');
const conf = require('../conf.json');

module.exports.readDirectory = (dir, cb) => {
    let dir_abs = path.normalize(conf.dataDir + dir);
    fs.readdir(dir_abs, (err, files) => {
        if (err) return cb(new Error("Error reading directory."));

        files = files.map((file) => {
            return fs.lstatSync(dir_abs + file) && !fs.statSync(dir_abs + file).isFile() ? file + '/' : file;
        }).sort((a, b) => a.localeCompare(b));

        cb(null, files);
    })
}

module.exports.upload = (file, cb) => {   
    if (!file) return cb(new Error("No file selected.")); 

    file.mv(conf.dataDir + file.name, (err) => {
        if (err) return cb(new Error("Error storing file."));
        cb();
    })
}

module.exports.getList = (cb) => {
    fs.exists(conf.dataDir, (exists) => {
        if (!exists) {
            return cb();
        }

        fs.readdir(conf.dataDir, (err, files) => {
            if (err) return cb(new Error("Error retrieving available datafiles."));
    
            let list = [];
            files.forEach((filename, _) => {
                fs.stat(conf.dataDir + filename, (err, stats) => {
                    if (err) {
                        list.push({
                            filename: filename,
                            size: "error"
                        })
                    } else {
                        list.push({
                            filename: filename,
                            size: stats.size / 1000000.0
                        })
                    }
                    if (list.length == files.length) {
                        cb(null, list);
                    }
                })
            })
        })
    })
}