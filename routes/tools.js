const router = require("express").Router();

const tool_controller = require('../libs/tool-controller.js');

router.get('/run', (req, res) => {
    tool_controller.process(req.query.tool, req.query.files, JSON.parse(req.query.settings), (err, job_id) => {
        if (err) return res.status(500).send(err.message);
        res.send(job_id.toString());
    })
})

module.exports = router;