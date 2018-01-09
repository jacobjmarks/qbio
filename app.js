const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');

const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(fileUpload());

app.use(session({
    secret: 'qbio',
    resave: true,
    saveUninitialized: true
}))

app.post('/login', (req, res) => {
    if (req.body.pass == "woundreads") {
        req.session.authorized = true;
        return res.end();
    }
    return res.status(401).end();
})

app.use((req, res, next) => {
    if (!req.session.authorized) return res.render("login.pug", { unauthorized: true });
    return next();
});

app.use("/", require("./routes/index"));
app.use("/jobs", require("./routes/jobs"));
app.use("/job", require("./routes/job"));
app.use("/data", require("./routes/data"));
app.use("/tools", require("./routes/tools"));
app.use("/session", require("./routes/session"));

app.use((req, res) => {
    res.render("error.pug", { message: "404 Not Found" });
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
})