"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainPayload = exports.PayloadType = void 0;
var PayloadType;
(function (PayloadType) {
    PayloadType[PayloadType["MESSAGE"] = 0] = "MESSAGE";
    PayloadType[PayloadType["CONNECT"] = 1] = "CONNECT";
    PayloadType[PayloadType["DISCONNECT"] = 2] = "DISCONNECT";
})(PayloadType = exports.PayloadType || (exports.PayloadType = {}));
class DomainPayload {
    constructor(type, data, clientId) {
        this.type = type;
        this.data = data;
        this.id = clientId || null;
    }
    static parserPayload(string) {
        let payload = JSON.parse(string.toString());
        return new DomainPayload(payload.type, payload.data, payload.id);
    }
    toString() {
        return JSON.stringify({ type: this.type, data: this.data, id: this.id });
    }
    static createMessagePayload(data, clientId) {
        return new DomainPayload(PayloadType.MESSAGE, data, clientId).toString();
    }
    static createConnectPayload(clientId) {
        return new DomainPayload(PayloadType.CONNECT, null, clientId).toString();
    }
    static createDisconnectPayload(code, clientId) {
        return new DomainPayload(PayloadType.DISCONNECT, code, clientId).toString();
    }
}
exports.DomainPayload = DomainPayload;
