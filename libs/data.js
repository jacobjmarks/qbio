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

    dir = path.join(conf.dataDir, dir);

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

        folders = folders.sort((a, b) => a.localeCompare(b)).map((folder) => { return {name: folder, size: null} });
        files = files.sort((a, b) => a.localeCompare(b));
        
        if (files.length == 0) return cb(null, folders.concat(files), breadcrumbs);

        files.forEach((file, index) => {
            fs.stat(path.join(dir, file), (err, stats) => {
                files[index] = {
                    name: file,
                    size: (!err ? Number.parseFloat(stats.size / 1000000.0).toFixed(3) : "-") + " MB"
                }
                if (files.map((f) => f.name).reduce((a, b) => a && b)) {
                    cb(null, folders.concat(files), breadcrumbs);
                }
            })
        });
    })
}

module.exports.upload = (file, cb) => {
    if (!file) return cb(new Error("No file to upload."));

    fs.exists(conf.uploadDir, (exists) => {
        if (!exists) fs.mkdirSync(conf.uploadDir);
        file.mv(conf.uploadDir + file.name, (err) => {
            if (err) return cb(new Error("Error storing file."));
            cb();
        })
    })
}

module.exports.getUploaded = (cb) => {
    fs.exists(conf.uploadDir, (exists) => {
        if (!exists) return cb();

        fs.readdir(conf.uploadDir, (err, files) => {
            if (err) return cb(new Error("Error retrieving uploaded datafiles."));
    
            let list = [];
            files.forEach((file) => {
                fs.stat(path.join(conf.uploadDir, file), (err, stats) => {
                    list.push({
                        name: file,
                        size: (!err ? Number.parseFloat(stats.size / 1000000.0).toFixed(3) : "-") + " MB"
                    })
                    if (list.length == files.length) {
                        cb(null, list);
                    }
                })
            })
        })
    })
}

module.exports.readOtherDir = (dir, cb) => {
    fs.exists(path.join(conf.otherDir, dir), (exists) => {
        if (!exists) return cb(new Error(`'${path.join(conf.otherDir, dir)}' does not exist.`));

        fs.stat(path.join(conf.otherDir, dir), (err, stats) => {
            if (!stats.isDirectory) return cb(new Error(`'${path.join(conf.otherDir, dir)}' is not a directory.`));

            fs.readdir(path.join(conf.otherDir, dir), (err, files) => {
                let list = [];
                files.forEach((file) => {
                    fs.stat(path.join(conf.otherDir, dir, file), (err, stats) => {
                        list.push({
                            name: file,
                            size: (!err ? Number.parseFloat(stats.size / 1000000.0).toFixed(3) : "-") + " MB"
                        })
                        if (list.length == files.length) {
                            cb(null, list);
                        }
                    })
                })
            })
        })
    })
}