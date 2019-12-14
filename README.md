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
    // interface obejct
}, {
    // duplex stream options
});

const ws = new WebSocket("https://open-haus.cloud/api/device/<id>/interface/<id>");

ws.on("open", () => {
    stream.websocket(ws);
});

stream.on("data", (data) => {
    console.log("Data from device", data);
});

setInterval(()=> {
    stream.write(`Hello Device: ${Date.now()}`);
});

```