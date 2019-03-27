"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var app = express();
//initialize a simple http server
var server = http.createServer(app);
//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server: server });
wss.on('connection', function (ws) {
    //connection is up, let's add a simple simple event
    ws.on('message', function (message) {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        //send back the message to the other clients
        wss.clients
            .forEach(function (client) {
            if (client != ws) {
                client.send(message);
            }
        });
    });
});
//start our server
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started");
});
