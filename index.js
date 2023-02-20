const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 8080
});
let clicks = 0;
let maxClicks = 100;
let clientsOnline = 0;
const clients = [];

var app = new Proxy({ clicks: clicks, maxClicks: maxClicks, clientsOnline: clientsOnline }, {
    set: function(target, key, value) {
        //functionality
 

        target[key] = value;
        broadcastMessage(JSON.stringify({totalClicks: app.clicks, clientsOnline: app.clientsOnline}));
        clicks = app.clicks;
        maxClicks = app.maxClicks;
        clientsOnline = app.clientsOnline;
        return true;
    }
});

wss.on('connection', function connection(ws) {
    clients.push(ws);
    console.log('New client connected');
    app.clientsOnline += 1;
    console.log(clientsOnline);
    ws.send(JSON.stringify({ totalClicks: app.clicks, clientsOnline: app.clientsOnline }))
    ws.on('message', function incoming(buffer) {
        console.log('Received message:', buffer.toString());

        if (!isNaN(Number(buffer.toString()))) {
            app.clicks += Number(buffer.toString());
            ws.send(JSON.stringify({ update: "click successfully sent", totalClicks: app.clicks, clientsOnline: app.clientsOnline }));
        }
    });

    ws.on('close', function close(code, reason) {
        console.log(`Client disconnected with code ${code} and reason ${reason}`);
        app.clientsOnline -= 1;
        console.log(app.clientsOnline);
        clients.splice(clients.indexOf(ws), 1);
    })
});

function broadcastMessage(msg) {
  // Loop through all active WebSocket connections and send the message to each one
  clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}