const WebSocket = require("ws");

const wss = new WebSocket.Server({
    port: 8080
});



wss.on("listening", () => {
    let addr = wss.address();
    console.log("Server ready for connections, listening on ws://%s:%s", addr.address, addr.port);
});


// wait for client connection
wss.on("connection", function connection(ws) {

    // listen for messages on connected client socket
    ws.on("message", function incoming(data) {

        // broadcast message to all other connected clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });

    });

});