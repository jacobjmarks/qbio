const { exec } = require('child_process');

const tools = [
    {
        name: "Tool A",
        func: toolA
    }
]

module.exports.process = (file, tool, cb) => {
    if (!tool) return cb(new Error("Invalid tool."));
    if (!file) return cb(new Error("Invalid datafile."));

    tools.find((t) => t.name == tool, (tool) => {
        tool.func(conf.dataDir + file, (err, result) => {
            if (err) return cb(new Error("Internal tool error."));
            cb(null, result);
        });
    })
}

function toolA(file, cb) {
    exec(`docker exec toolA bash -c "python test.py '${file}'"`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return cb(true);
        }
        cb(null, stdout);
    })
}