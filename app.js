const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
  };
const routes = require('./route');
const { checkSessionTimeout } = require('./middlewares/session')
const app = express();
process.env.DEBUG = 'true';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(flash());
app.use(session({
    secret: 'ITSECWB',
    resave: false,
    saveUninitialized: true
}));
app.use(checkSessionTimeout);

https.createServer(options, app).listen(8443, () => {
    console.log('HTTPS server running on https://localhost:8443')
})

app.use('/', routes);