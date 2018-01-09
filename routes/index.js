const router = require("express").Router();

router.get('/', (req, res) => {
    res.render('index.pug', { tools: require('../tools.json') });
})

module.exports = router;