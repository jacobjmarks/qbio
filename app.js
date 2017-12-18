const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const PORT = 3000;

const jobs = require('./libs/jobs.js');
const datafile = require('./libs/datafile.js');
const tool_controller = require('./libs/tool-controller.js');
const tools = require('./tools.json');

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('index.pug', {tools:tools});
})

app.get('/newjob', (req, res) => {
    res.render('new-job.pug', {tools:tools});
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
    tool_controller.process(req.query.file, req.query.tool, req.query.settings, (err, job_id) => {
        if (err) return res.status(500).send(err.message);
        res.send(job_id.toString());
    })
})

app.post('/getChart/:id', (req, res) => {
    let id = req.params.id;

    jobs.chart(id, (err, chart) => {
        if (err) return res.status(500).send(err.message);
        res.send(chart);
    })
})

app.post('/jobStatus', (req, res) => {
    jobs.stats((err, jobs) => {
        if (err) return res.status(500).send(err.message);
        res.json(jobs);
    })
})

app.post('/deleteJob/:id', (req, res) => {
    jobs.delete(req.params.id, (err) => {
        if (err) res.status(500).end();
        res.end();
    })
})

app.get('/job/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.render('job.pug', {job: job});
    })
})

app.post('/job/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.json(job);
    })
})

app.get('/job/:id/log', (req, res) => {
    jobs.getLog(req.params.id, (err, log) => {
        if (err) return res.status(500).send(err.message);
        res.send(log);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})