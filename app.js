var express = require('express');
var redis = require('redis')
var multer = require('multer')
var fs      = require('fs')


try{
    var redisClient = redis.createClient(6379, '127.0.0.1', {})
    redisClient.set("key", "value");
    redisClient.get("key", function(err,value){ console.log(value)});
} catch (ex){
    console.log(ex);
}

var app = express();

app.use(function(req, res, next) 
{
    // console.log(req.method, req.url);

    redisClient.lpush('recent_queue', req.url);
    redisClient.ltrim('recent_queue', 0, 4);

    next(); // Passing the request to the next handler in the stack.
});


var last_key = "key";

app.get('/set', function(req, res) {
    {
        var key = 'key'+Math.round(Math.random()*(1000));
        redisClient.set(key, "this message will self-destruct in 10 seconds");
        last_key = key;
        redisClient.expire(key, 10);
        res.send("Key Set!");
    }
})


app.get('/get', function(req, res) {
        redisClient.get(last_key, function(err,value){
            res.send(value);
        })
})

app.get('/recent', function(req, res) {
        // console.log('Recived a request');
        var responseText = '';
        redisClient.lrange('recent_queue', 0, 4, function(err,list){
            for(i in list){
                 responseText +=list[i] + '<br>';
            }
            res.send(responseText);
        })

})

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   // console.log(req.body) // form fields
   // console.log(req.files) // form files

   if( req.files.image )
   {
       fs.readFile( req.files.image.path, function (err, data) {
            // if (err) throw err;
            var img = new Buffer(data).toString('base64');
            // console.log(img);
            redisClient.lpush('image_queue', img);
        });
    }

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
    {
        // if (err) throw err
        res.writeHead(200, {'content-type':'text/html'});
        redisClient.lpop('image_queue', function(err, imgData){
            res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imgData+"'/>");
            res.end();
        })
        // items.forEach(function (imagedata) 
        // {
        // res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
        // });
    
    }
})

var port = process.argv.splice(2)[0];

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})