/*
* Primary file for the API
*
*/

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Instantiating the HTTP server
var httpServer = http.createServer(function(req, res){    
    unifiedServer(req, res);
});

// Start the http server
httpServer.listen(3000, function(){
    console.log('The server is listening on port ' + 3000);
});

// All the server logic for both http and https servers
var unifiedServer = function(req, res){
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        // Choose the handler this request should go to.  If one is not found use the notFound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'payload': buffer,
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){

            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by handler or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

        });

    });
};

// Define the handlers
var handlers = {};

// Ping Handler
handlers.ping = function(data, callback){
    callback(200);
}

// Define a request router
handlers.notFound = function(data, callback){
    callback(404);
};

handlers.helloWorld = function(data, callback){
    var returnObj = {};

    if(data.queryStringObject && data.queryStringObject.name){
        returnObj.message = `Hello World to you ${data.queryStringObject.name}!`;
    } else {
        returnObj.message = "Hello World to you anonymous";
    }   
    
    callback(200, returnObj);
}

var router = {
    'ping': handlers.ping,
    'hello': handlers.helloWorld
};
