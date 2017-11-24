const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const PORT = 3000;
const dataDir = './data/';

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('index.pug');
})

app.post('/uploadfile', (req, res) => {
    if (!req.files) return res.status(400).send("No file selected.");

    let file = req.files.file;
    file.mv(`data/${file.name}`, (err) => {
        if (err) return res.status(500).send("Error uploading file.\n" + err);
        res.end();
    })
})

app.post('/getAvailableData', (req, res) => {
    fs.readdir(dataDir, (err, files) => {
        if (err) return res.status(500).send("Error retrieving available datafiles.\n" + err)

        let datafileInfo = [];
        files.forEach((filename, _) => {
            fs.stat(dataDir + filename, (err, stats) => {
                if (err) {
                    datafileInfo.push({
                        filename: filename,
                        size: "error"
                    })
                } else {
                    datafileInfo.push({
                        filename: filename,
                        size: stats.size / 1000000.0
                    })
                }
                if (datafileInfo.length == files.length) {
                    res.send(datafileInfo);
                }
            })
        })
    })
})

app.get('/run', (req, res) => {
    let tool = req.query.tool;
    let file = req.query.file;

    if (!tool) return res.status(400).send("Invalid tool.");
    if (!file) return res.status(400).send("Invalid datafile.");

    fs.readFile(dataDir + file, (err, data) => {
        if (err) return res.status(500).send("Error reading datafile.");
        res.send(data);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})