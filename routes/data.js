const router = require("express").Router();

const data = require('../libs/data.js');

router.get('/server/:dir', (req, res) => {
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

router.get('/uploaded', (req, res) => {
    data.getUploaded((err, list) => {
        if (err) return res.status(500).send(err.message);
        res.send(list);
    })
})

router.post('/upload', (req, res) => {
    data.upload(req.files && req.files.file, (err) => {
        if (err) return res.status(500).send(err.message);
        res.end();
    })
})

module.exports = router;