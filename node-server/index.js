"use strict";

const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const authentication = require('./middlewares/authentication');
const cors = require('cors');

const compression = require('compression');
const cacheController = require('express-cache-controller');
const port = 3033;

const controller = require('./api/controller');
const secured = require('./api/secured');

const app = express();
const options = {
    key: fs.readFileSync(path.join(__dirname, './ssl', 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, './ssl', 'fullchain.pem'))
};

app.use(compression());
app.use(cacheController({
    noStore: true
}));
app.use(cookieParser());
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit:'50mb' }));
app.use('/api', authentication.midAuthentication(), controller.router);
app.use('/api', authentication.realAuthentication(), secured.router); // Esta va con real authentication

app.set('port', port);

// const server = https.createServer(options, app);
const server = http.createServer(app);

server.listen(port, () => {
    console.log('Up and Running');
});

process.on('uncaughtException', function (e) {
    console.log(e);
});
