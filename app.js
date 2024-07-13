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
const PORT = process.env.PORT || 3000;
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

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

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    console.error(error);
    res.status(500).send('Internal Server Error');
});


// app.listen(PORT, function () {
//     console.log("Server is running at port: " + PORT);
// });

https.createServer(options, app).listen(8443, () => {
    console.log('HTTPS server running on https://localhost:8443')
})

app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (DEBUG_MODE) {
        console.log('Debugging is enabled: Detailed error shown');
        res.status(err.status || 500).json({
            message: err.message,
            stack: err.stack // Send stack trace only if debugging is enabled
        });
    } else {
        console.log('Debugging is disabled: Generic error shown');
        res.status(err.status || 500).send('An error occurred! Please try again later.');
    }
});