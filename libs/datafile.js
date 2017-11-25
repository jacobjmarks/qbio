const fs = require('fs');
const conf = require('../conf.json');

module.exports.upload = (file, cb) => {   
    if (!file) return cb(new Error("No file selected.")); 

    const storeDatafile = () => {
        file.mv(conf.dataDir + file.name, (err) => {
            if (err) return cb(new Error("Error storing file."));
            cb();
        })
    }

    fs.exists(conf.dataDir, (exists) => {
        if (!exists) {
            fs.mkdir(conf.dataDir, (err) => {
                if (err) return cb (new Error("Error creating new data directory."));
                storeDatafile();
            })
        } else {
            storeDatafile();
        }
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

module.exports.process = (file, tool, cb) => {
    if (!tool) return cb(new Error("Invalid tool."));
    if (!file) return cb(new Error("Invalid datafile."));

    fs.readFile(conf.dataDir + file, (err, data) => {
        if (err) return cb(new Error("Error reading datafile."));
        cb(null, data);
    })
}