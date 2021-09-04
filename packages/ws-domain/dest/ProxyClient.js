"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyClient = void 0;
const events_1 = __importDefault(require("events"));
const DomainPayload_1 = require("./DomainPayload");
class ProxyClient extends events_1.default {
    constructor(webSocket) {
        super();
        this._ws = webSocket;
        this._ws.onmessage = this.handleMessage.bind(this);
    }
    handleMessage(rawData) {
        let payload = DomainPayload_1.DomainPayload.parserPayload(rawData);
        let { data, type, id } = payload;
        switch (type) {
            case DomainPayload_1.PayloadType.MESSAGE:
                if (this.onmessage)
                    this.onmessage(data);
                this.emit("message", data);
        }
    }
    send(message) {
        this._ws.send(DomainPayload_1.DomainPayload.createMessagePayload(message));
    }
}
exports.ProxyClient = ProxyClient;
//# sourceMappingURL=ProxyClient.js.map