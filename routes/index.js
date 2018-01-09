const router = require("express").Router();

const jobs = require('../libs/jobs.js');
const tool_controller = require('../libs/tool-controller.js');
const tools = require('../tools.json');

router.get('/', (req, res) => {
    res.render('index.pug', {tools:tools});
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