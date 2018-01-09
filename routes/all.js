const router = require("express").Router();

const jobs = require('../libs/jobs.js');
const data = require('../libs/data.js');
const tool_controller = require('../libs/tool-controller.js');
const tools = require('../tools.json');

router.get('/', (req, res) => {
    res.render('index.pug', {tools:tools});
})

router.get('/newjob', (req, res) => {
    res.render('new-job.pug', {tools:tools});
})

router.get('/jobs', (req, res) => {
    res.render('jobs.pug');
})

router.post('/directory/:dir', (req, res) => {
    req.session.dataBrowser = req.session.dataBrowser || {};
    let dir = (() => {
        if (req.params.dir == "undefined") {
            return req.session.dataBrowser.currentDir || '/';
        }
        return req.params.dir;
    })()

    data.readDirectory(dir, (err, files, breadcrumbs) => {
        if (err) return res.status(500).send(err.message);
        req.session.dataBrowser.breadcrumbs = breadcrumbs;
        req.session.dataBrowser.currentDir = dir;
        res.send({
            dir: dir,
            files: files,
            breadcrumbs: breadcrumbs
        });
    })
})

router.post('/uploadfile', (req, res) => {
    data.upload(req.files && req.files.file, (err) => {
        if (err) return res.status(500).send(err.message);
        res.end();
    })
})

router.post('/getUploadedData', (req, res) => {
    data.getUploaded((err, list) => {
        if (err) return res.status(500).send(err.message);
        res.send(list);
    })
})

router.get('/run', (req, res) => {
    tool_controller.process(req.query.tool, req.query.files, JSON.parse(req.query.settings), (err, job_id) => {
        if (err) return res.status(500).send(err.message);
        res.send(job_id.toString());
    })
})

router.post('/getChart/:id', (req, res) => {
    jobs.chart(req.params.id, (err, chart) => {
        if (err) return res.status(500).send(err.message);
        res.send(chart);
    })
})

router.post('/jobStatus', (req, res) => {
    jobs.stats((err, jobs) => {
        if (err) return res.status(500).send(err.message);
        res.json(jobs);
    })
})

router.post('/deleteJob/:id', (req, res) => {
    jobs.delete(req.params.id, (err) => {
        if (err) res.status(500).end();
        res.end();
    })
})

router.get('/job/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.render('job.pug', {job: job});
    })
})

router.post('/job/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.json(job);
    })
})

router.get('/job/:id/log', (req, res) => {
    jobs.getLog(req.params.id, (err, log) => {
        if (err) return res.status(500).send(err.message);
        res.send(log);
    })
})

router.get('/job/:id/result', (req, res) => {
    jobs.getResult(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result);
    })
})

router.get('/job/:id/result/download', (req, res) => {
    jobs.downloadResult(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result);
    })
})

router.post('/updateSessionData', (req, res) => {
    let objects = req.body;
    for (let key in objects) {
        req.session[key] = objects[key];
    }
    res.end();
})

router.post('/getSessionData/:object', (req, res) => {
    let object = req.params.object;
    if (!req.session[object]) return res.status(400).send("Session data not found.");
    res.send(req.session[object]);
})

module.exports = router;