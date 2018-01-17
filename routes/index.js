const router = require("express").Router();

router.get('/', (req, res) => {
    res.render('index.pug', { tools: req.app.get("tool_meta") });
})

module.exports = router;