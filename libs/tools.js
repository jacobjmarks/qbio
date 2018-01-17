const fs = require('fs');
const path = require('path');

const toolDir = "./TOOLS";

module.exports.getMeta = function(cb) {
    fs.readdir(toolDir, (err, files) => {
        if (err) return cb(new Error("Error reading tool directory."))

        let metaFileCount = files.length;
        let toolMeta = {};
        files.forEach((file) => {
            fs.readFile(path.join(toolDir, file, "meta.json"), (err, data) => {
                if (err) {
                    metaFileCount--;
                } else {
                    let meta = JSON.parse(data);
                    toolMeta[meta.name] = meta;
                }
                
                if (Object.keys(toolMeta).length == metaFileCount) {
                    if (metaFileCount == 0) return cb(new Error("Error reading tool meta."));
                    return cb(null, toolMeta);
                }
            })
        })
    })
}