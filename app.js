const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');

const PORT = 3000;

const jobs = require('./libs/jobs.js');
const data = require('./libs/data.js');
const tool_controller = require('./libs/tool-controller.js');
const tools = require('./tools.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(fileUpload());

app.use(session({
    secret: 'qbio',
    resave: true,
    saveUninitialized: true
}))

let auth = (req, res, next) => {
    if (!req.session.authorized) {
        return res.render("login.pug", { unauthorized: true });
    }
    return next();
}

app.post('/login', (req, res) => {
    if (req.body.user == "woundreads" && req.body.pass == "bigsi") {
        req.session.authorized = true;
        return res.end();
    }
    return res.status(401).end();
})

// app.use(auth);

app.get('/', (req, res) => {
    res.render('index.pug', {tools:tools});
})

app.get('/newjob', (req, res) => {
    res.render('new-job.pug', {tools:tools});
})

app.get('/jobs', (req, res) => {
    res.render('jobs.pug');
})

app.post('/directory/:dir', (req, res) => {
    req.session.dataBrowser = req.session.dataBrowser || {};
    let dir = (() => {
        if (req.params.dir == "undefined") {
            return req.session.dataBrowser.currentDir || '/';
        }
        return req.params.dir;
    })()

    data.readDirectory(dir, (err, files, breadcrumbs) => {
        req.session.dataBrowser.breadcrumbs = breadcrumbs;
        req.session.dataBrowser.currentDir = dir;
        res.send({
            dir: dir,
            files: files,
            breadcrumbs: breadcrumbs
        });
    })
})

app.post('/uploadfile', (req, res) => {
    data.upload(req.files && req.files.file, (err) => {
        if (err) return res.status(500).send(err.message);
        res.end();
    })
})

app.post('/getAvailableData', (req, res) => {
    data.getList((err, list) => {
        if (err) return res.status(500).send(err.message);
        res.send(list);
    })
})

app.get('/run', (req, res) => {
    tool_controller.process(req.query.tool, req.query.files, JSON.parse(req.query.settings), (err, job_id) => {
        if (err) return res.status(500).send(err.message);
        res.send(job_id.toString());
    })
})

app.post('/getChart/:id', (req, res) => {
    jobs.chart(req.params.id, (err, chart) => {
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

app.get('/job/:id/result', (req, res) => {
    jobs.getResult(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result);
    })
})

app.get('/job/:id/result/download', (req, res) => {
    jobs.downloadResult(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result);
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})