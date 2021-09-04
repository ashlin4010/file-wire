"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyConnection = void 0;
const events_1 = __importDefault(require("events"));
const DomainPayload_1 = require("./DomainPayload");
class ProxyConnection extends events_1.default {
    constructor(webSocket, id) {
        super();
        this._ws = webSocket;
        this.id = id;
    }
    receiveClose(code) {
        if (this.onclose)
            this.onclose(code);
        this.emit("close", code);
    }
    receiveMessage(data) {
        if (this.onmessage)
            this.onmessage(data);
        this.emit("message", data);
    }
    close(code) {
        this._ws.send(DomainPayload_1.DomainPayload.createDisconnectPayload(code, this.id));
    }
    send(data) {
        this._ws.send(DomainPayload_1.DomainPayload.createMessagePayload(data, this.id));
    }
}
exports.ProxyConnection = ProxyConnection;
