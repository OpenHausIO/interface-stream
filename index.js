"use strict";

const { Duplex } = require("stream");
const util = require("util");


function interfaceStream(options) {

    this.options = Object.assign({
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
    }, options);

    Duplex.call(this, this.options);
    this.ws = null;

    this.on("end", duplexOnEnd);
    this.on("error", duplexOnError);

};


util.inherits(interfaceStream, Duplex);


/**
 * Emits the `"close"` event on a stream.
 *
 * @param {stream.Duplex} The stream.
 * @private
 */
function emitClose(stream) {
    stream.emit("close");
}


/**
 * The listener of the `"end"` event.
 *
 * @private
 */
function duplexOnEnd() {
    if (!this.destroyed && this._writableState.finished && this.options.emitClose) {
        this.destroy();
    }
}


/**
 * The listener of the `"error"` event.
 *
 * @private
 */
function duplexOnError(err) {

    this.removeListener("error", duplexOnError);
    this.destroy();

    if (this.listenerCount("error") === 0) {
        // Do not suppress the throwing behavior.
        this.emit("error", err);
    }

}



/**
 * 
 */
interfaceStream.prototype.attach = function (ws) {

    this.ws = ws;
    this.emit("websocket.attached", ws);

    ws.once("close", () => {
        this.emit("websocket.detached", ws);
    });

    let resumeOnReceiverDrain = true;

    function receiverOnDrain() {
        if (resumeOnReceiverDrain) {
            ws._socket.resume();
        }
    }

    if (ws.readyState === ws.CONNECTING) {

        ws.once("open", function open() {
            ws._receiver.removeAllListeners("drain");
            ws._receiver.on("drain", receiverOnDrain);
        });

    } else {

        ws._receiver.removeAllListeners("drain");
        ws._receiver.on("drain", receiverOnDrain);

    }


    ws.on("message", (msg) => {
        if (!this.push(msg)) {

            resumeOnReceiverDrain = false;
            ws._socket.pause();

        }
    });


    ws.once("error", (err) => {
        this.destroy(err);
    });


    ws.once("close", () => {
        if (this.destroyed) {
            // return;
        } else {
            this.push(null);
        }
    });


    // duplex._destroy
    this._destroy = (err, cb) => {

        if (ws.readyState === ws.CLOSED) {
            cb(err);
            process.nextTick(emitClose, this);
            return;
        }

        ws.once("close", () => {
            cb(err);
            process.nextTick(emitClose, this);
        });

        ws.terminate();

    };


    // duplex._final
    this._final = () => {
        if (ws.readyState === ws.CONNECTING) {

            ws.once("open", () => {
                this._final(cb);
            });

        } else {
            if (ws._socket._writableState.finished) {

                if (this._readableState.endEmitted) {
                    this.destroy();
                }

                cb();

            } else {

                ws._socket.once("finish", function finish() {
                    // `duplex` is not destroyed here because the `"end"` event will be
                    // emitted on `duplex` after this `"finish"` event. The EOF signaling
                    // `null` chunk is, in fact, pushed when the WebSocket emits `"close"`.
                    cb();
                });

                ws.close();

            }
        }
    };


    // duplex._read
    this._read = function () {
        if (ws.readyState === ws.OPEN && !resumeOnReceiverDrain) {

            resumeOnReceiverDrain = true;

            if (!ws._receiver._writableState.needDrain) {
                ws._socket.resume();
            }

        }
    };

    this._write = (chunk, encoding, cb) => {
        if (ws.readyState === ws.CONNECTING) {

            ws.once("open", () => {
                this._write(chunk, encoding, cb);
            });

        } else {

            ws.send(chunk, cb);

        }
    };

};


/**
 * 
 */
interfaceStream.prototype.detach = function () {

    if (this.ws) {
        this.ws.close();
        // this.ws.destroy(); ?
    }

}


module.exports = function (options) {
    if (!(this instanceof interfaceStream)) {
        return new interfaceStream(options);
    } else {
        return this;
    }
};