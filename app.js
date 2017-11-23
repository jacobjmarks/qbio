const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const PORT = 3000;

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('index.pug');
})

app.post('/uploadfile', (req, res) => {
    if (!req.files) return res.status(400).send("No file selected.");

    let file = req.files.file;
    file.mv(`data/${file.name}`, (err) => {
        if (err) return res.status(500).send("Error uploading file.\n" + err);
        res.end();
    })
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})