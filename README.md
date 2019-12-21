# OpenHaus Server Device Interface

## Description
`Stream ↔ WebSocket ↔ Stream`


## Documentation
@TODO


## Example

```js
const WebSocket = require("ws");
const interfaceStream = require("interface-stream");

const stream = new interfaceStream({
    // duplex stream options
});

const ws = new WebSocket("https://open-haus.cloud/api/devices/<id>/interfaces/<id>");

ws.on("open", () => {
    stream.attach(ws);
});

stream.on("data", (data) => {
    console.log("Data from device", data);
});

setInterval(()=> {
    stream.write(`Hello Device: ${Date.now()}`);
}, 1000);


setTimeout(() => {
    stream.detach();
}, 5000);

```