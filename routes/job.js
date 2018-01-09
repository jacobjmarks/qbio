const router = require("express").Router();

const jobs = require('../libs/jobs.js');

router.get('/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.render('job.pug', {job: job});
    })
})

router.post('/:id', (req, res) => {
    jobs.get(req.params.id, (err, job) => {
        if (err) return res.status(500).send(err.message);
        res.json(job);
    })
})

router.delete('/:id', (req, res) => {
    jobs.delete(req.params.id, (err) => {
        if (err) res.status(500).end();
        res.end();
    })
})

router.get('/:id/log', (req, res) => {
    jobs.getLog(req.params.id, (err, log) => {
        if (err) return res.status(500).send(err.message);
        res.send(log);
    })
})

router.get('/:id/result', (req, res) => {
    jobs.getResult(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result);
    })
})

router.get('/:id/result/download', (req, res) => {
    jobs.downloadResult(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.send(result);
    })
})

module.exports = router;