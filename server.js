var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sio = require('socket.io').listen(server);
var path = require("path");
var fs = require('fs');

app.use(express.static(path.join(__dirname, 'public_html')))

app.get('/', function(req, res){
    console.log( 'A connection is now on home!' );
});

app.get('/input', function(req, res){
    fs.readFile(__dirname + '/public_html/input.html',

    // If file not found, continue to this function.
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

app.get('/output', function(req, res){
    fs.readFile(__dirname + '/public_html/output.html',

    // If file not found, continue to this function.
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

app.get('*', function(req, res){
    fs.readFile(__dirname + '/public_html/404.html',

    // If file not found, continue to this function.
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

var listener = server.listen( process.env.PORT || 3001, () => {
    console.log( 'Server is now running on ' + listener.address().address + ':' + listener.address().port );
});

var conns = [];

sio.on('connection', function (socket) {

    var curroom = '';
    //Welcome the client, send this event!
    socket.emit('welcome', { token: 'sampletokenid' });

    socket.on('session', function (data) {
        curroom = data.chanid;
        socket.join(curroom);
        console.log("Connected! " + socket.id + ' Type: ' + data.contype );
    });

    socket.on('connect', function () {
        console.log("Connected: " + socket.id);
    });

    socket.on('reconnect', function () {
        console.log("Reconnected: " + socket.id);
    });

    socket.on('play', function (data) {
        console.log( 'Playing! ' + data.sound );

        //Only for user output.
        socket.broadcast.to(curroom).emit('play', data.sound);
        //socket.emit('play', data.sound);
    });

    socket.on('reload', function (data) {
        console.log( 'Reloading! ' + data );

        //Only for user output.
        socket.broadcast.to(curroom).emit('reload', data);
    });

    socket.on('disconnect', function () {
        console.log("Disconnected! " + socket.id);
        socket.emit('disconnection');
    });
});