const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const routes = require('./route');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'ITSECWB',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    console.error(error);
    res.status(500).send('Internal Server Error');
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server is running at port: " + port);
});

app.use('/', routes);