/*
Basic concept: https://mazira.com/blog/introduction-load-balancing-nodejs
*/
var redis = require('redis');
var httpProxy = require('http-proxy');
var url = require("url");
var http = require("http");

var port_list = process.argv.splice(2);

var redisClient = redis.createClient(6379, '127.0.0.1', {});

port_list.forEach(function(port){
    var address = 'http://localhost:'+port;
    redisClient.rpush('compute_nodes', address);
});

var proxy = httpProxy.createProxyServer({});

http.createServer(function(req, res) {
    redisClient.lpop('compute_nodes', function(err, address){
        var pathname = url.parse(req.url).pathname;
        var compute_node = {target:address};
        compute_node.path = pathname;
        proxy.web(req, res, compute_node);
        redisClient.rpush('compute_nodes', address);
    });
}).listen(8000);