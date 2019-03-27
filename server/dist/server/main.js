"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
//initialize a simple http server
const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        //send back the message to the other clients
        wss.clients
            .forEach(client => {
            if (client != ws) {
                client.send(message);
            }
        });
    });
});
//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started`);
});
//# sourceMappingURL=main.js.map