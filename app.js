const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const PORT = 3000;

const jobs = require('./libs/jobs.js');
const datafile = require('./libs/datafile.js');
const tool_controller = require('./libs/tool-controller.js');

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('index.pug');
})

app.get('/newjob', (req, res) => {
    res.render('new-job.pug');
})

app.get('/jobs', (req, res) => {
    res.render('jobs.pug');
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
    tool_controller.process(req.query.file, req.query.tool, (err, job_id) => {
        if (err) return res.status(500).send(err.message);
        res.send(job_id.toString());
    })
})

app.post('/jobStatus', (req, res) => {
    jobs.stats((err, jobs) => {
        if (err) return res.status(500).send(err.message);
        res.json(jobs);
    })
})

app.get('/job/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.render('job.pug', {job: job});
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})