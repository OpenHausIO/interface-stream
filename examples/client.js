const WebSocket = require("ws");
const interfaceStream = require("../index.js");

const stream = new interfaceStream({
    // duplex stream options
});

stream.on("websocket.attached", () => {
    console.log("WebSocket attached");
});

stream.on("websocket.detached", () => {
    console.log("WebSocket detached");
});



const ws = new WebSocket("ws://127.0.0.1:8080");

ws.on("open", function open() {
    console.log("WS.open");
    stream.attach(ws);
});

ws.on("close", () => {
    console.log("WS.close");
    stream.detach();
});


stream.on("data", (data) => {
    console.log("[%s] Data from server: '%s'", Date.now(), data)
});


setInterval(() => {
    stream.write(`[${Date.now()}] Hello Server, from PID: ${process.pid} `)
}, 3000);