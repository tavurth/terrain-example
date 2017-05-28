"use strict";

/**
 * Global library includes
 */
let express = require('express');

/**
 * Our local application
 */
(function mainApp() {
    // Disable serving from the build directory unless we're in production mode

    let buildDir = __dirname;
    buildDir = buildDir.slice(0, buildDir.lastIndexOf('/')) + '/dist';

    // Create the application
    let app = express();

    // Setting up environment variables
    app.set('port', 8888);
    console.log("App listening on", app.get('port'));

    // Use static file hosting
    app.use(express.static(buildDir));

    // Serve our index if allowed
    app.get('/:index.html?', (req, res) => {
        res.sendFile(buildDir + '/index.html');
    });

    // Serve our favicon
    app.get('/favicon.ico', (req, res) => {
        res.sendFile(buildDir + '/favicon.ico');
    });

    // Serve our images
    app.get('/img/*', (req, res) => {
        res.sendFile(buildDir + '/' + req.originalUrl);
    });

    // Serve 404 file for exceptions
    app.use((req, res) => {
        console.log(buildDir + '/index.html');
        res.sendFile(buildDir + '/index.html');
    });

    let http   = require('http');
    let server = http.createServer(app);

    // Creating the server
    server.listen(app.get('port'), () => {
        console.log('Started server on port ' + app.get('port') + '...');
    });
})();
