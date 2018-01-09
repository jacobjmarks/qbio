const router = require("express").Router();

const jobs = require('../libs/jobs.js');

router.get('/', (req, res) => {
    res.render('jobs.pug');
})

router.get('/new', (req, res) => {
    res.render('new-job.pug', { tools: require('../tools.json') });
})

router.get('/status', (req, res) => {
    jobs.stats((err, jobs) => {
        if (err) return res.status(500).send(err.message);
        res.json(jobs);
    })
})

module.exports = router;