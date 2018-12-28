/*
 * HWK 1: RESTful JSON API
 */
// Dependencies
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');


// Instantiate the HTTPS server
var httpsServerOptions = {
  'key' :  fs.readFileSync('./https/key.pem'), 
  'cert' : fs.readFileSync('./https/cert.pem')
};

var server = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res);
});

// Start the HTTPS server
server.listen(config.port,function(){
  console.log("Listening on port "+ config.port+" in "+ config.envName+" node");
});

// All the server logic for https server
var unifiedServer = function(req,res){
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url,true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTPS method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer += decoder.end();
    // Choose the handler this request should go to. If one is not found, use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 
    // Construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };
   // Route the request to the handler specified in the router
   chosenHandler(data,function(statusCode,payload){
     // Use the status code called back by the handler, or default
     statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

     // Use the payload called back by the handler, or default to an empty object
     payload = typeof(payload) == 'object' ? payload : {};

     // Conver the payload to a string
     var payloadString = JSON.stringify(payload);

     // Return the response
     res.writeHead(statusCode);
     res.end(payloadString); 

     // Log the request path
     console.log('Return the response: ',statusCode,payloadString);
     console.log('headers: ', headers);
     console.log('queryStringObject: ', queryStringObject);
     console.log('trimmedPath: ', trimmedPath);
     console.log('buffer: ', buffer);
     console.log('path: ', path);
   });
  });
};

// Define the handlers
var handlers = {};

// Hello handlers
handlers.hello = function(data,callback){
  // Callback a https status code, and a payload object
  callback(406, {'message' : 'Welcome to my first JSON API'});
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};
var router = {
  'hello' : handlers.hello
};
