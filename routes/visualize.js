const router = require("express").Router();

router.get('/', (req, res) => {
    res.render('visualize.pug');
})

module.exports = router;