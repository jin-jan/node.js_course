/*
 * HWK 1: RESTful JSON API
 */
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var httpsServerOptions = {
  'key' :  fs.readFileSync('./https/key.pem'), 
  'cert' : fs.readFileSync('./https/cert.pem')
};

var server = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res);
});

server.listen(config.port,function(){
  console.log("Listening on port "+ config.port+" in "+ config.envName+" node");
});

var unifiedServer = function(req,res){
  var parsedUrl = url.parse(req.url,true);
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');
  var queryStringObject = parsedUrl.query;
  var method = req.method.toLowerCase();
  var headers = req.headers;
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer += decoder.end();
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };
   chosenHandler(data,function(statusCode,payload){
     statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
     payload = typeof(payload) == 'object' ? payload : {};
     var payloadString = JSON.stringify(payload);
     res.setHeader('Content-type', 'applications/json');
     res.writeHead(statusCode);
     res.end(payloadString); 
     console.log('Return the response: ',statusCode,payloadString);
     console.log('headers: ', headers);
     console.log('queryStringObject: ', queryStringObject);
     console.log('trimmedPath: ', trimmedPath);
     console.log('buffer: ', buffer);
     console.log('path: ', path);
   });
  });
};

var handlers = {};

handlers.hello = function(data,callback){
  callback(406, {'message' : 'Welcome to my first JSON API'});
};

handlers.notFound = function(data,callback){
  callback(404);
};
var router = {
  'hello' : handlers.hello
};
