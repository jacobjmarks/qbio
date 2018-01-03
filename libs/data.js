const fs = require('fs');
const path = require('path');
const conf = require('../conf.json');

module.exports.readDirectory = (dir, cb) => {
    let breadcrumbs = (() => {
        let crumbs = ['/'];        
        if (dir == '/') return crumbs;
        let dirs = dir.split('/');
        dirs = dirs.filter((d) => d != '');

        dirs.forEach((dir, index) => {
            let path = "/";
            for (let i = 0; i <= index; i++) {
                path += dirs[i] + '/';
            }
            crumbs.push(path);
        })

        return crumbs;
    })()

    dir = path.normalize(conf.dataDir + dir);

    fs.readdir(dir, (err, files) => {
        if (err) return cb(new Error("Error reading directory."));

        let folders = [];

        files = files.map((file) => {
            if (fs.lstatSync(dir + file).isSymbolicLink()) return false;
            if (!fs.statSync(dir + file).isFile()) {
                folders.push(file + '/');
                return false;
            }
            return file;
        }).filter((f) => f != false);

        folders = folders.sort((a, b) => a.localeCompare(b));
        files = files.sort((a, b) => a.localeCompare(b));

        cb(null, folders.concat(files), breadcrumbs);
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