const router = require("express").Router();

router.get('/:object', (req, res) => {
    let object = req.params.object;
    res.send(req.session[object]);
})

router.patch('/:object', (req, res) => {
    let object = req.params.object;
    req.session[object] = req.body;
    res.end();
})

module.exports = router;