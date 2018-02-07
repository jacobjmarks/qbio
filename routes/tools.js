const router = require("express").Router();

const tool_controller = require('../libs/tool-controller.js');
const data = require('../libs/data.js');

router.get('/run', (req, res) => {
    tool_controller.process(req.query.tool, req.query.files, JSON.parse(req.query.settings), (err, job_id) => {
        if (err) return res.status(500).send(err.message);
        res.send(job_id.toString());
    })
})

router.get('/bigsi/getSavedDatabases', (req, res) => {
    data.readOtherDir("/bigsi/", (err, files) => {
        if (err) return res.status(500).send(err);
        res.send(files);
    })
})

module.exports = router;