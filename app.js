const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const PORT = 3000;

const datafile = require('./libs/datafile.js');

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('index.pug');
})

app.post('/uploadfile', (req, res) => {
    datafile.upload(req.files && req.files.file, (err) => {
        if (err) return res.status(500).send(err.message);
        res.end();
    })
})

app.post('/getAvailableData', (req, res) => {
    datafile.getList((err, list) => {
        if (err) return res.status(500).send(err.message);
        res.send(list);
    })
})

app.get('/run', (req, res) => {
    datafile.process(req.query.file, req.query.tool, (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.send(results);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})