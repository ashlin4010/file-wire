"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyServer = void 0;
const events_1 = __importDefault(require("events"));
const ProxyConnection_1 = require("./ProxyConnection");
const DomainPayload_1 = require("./DomainPayload");
class ProxyServer extends events_1.default {
    constructor(webSocket) {
        super();
        this.clients = {};
        this._ws = webSocket;
        this._ws.onmessage = this.handleMessage.bind(this);
    }
    handleMessage(rawData) {
        let payload = DomainPayload_1.DomainPayload.parserPayload(rawData);
        let { data, type, id } = payload;
        switch (type) {
            case DomainPayload_1.PayloadType.CONNECT:
                this.handleMemberConnect(id);
                break;
            case DomainPayload_1.PayloadType.DISCONNECT:
                this.handelMemberDisconnect(id, data);
                break;
            case DomainPayload_1.PayloadType.MESSAGE:
                this.handelMemberMessage(id, data);
                break;
        }
    }
    handleMemberConnect(memberID) {
        if (!memberID)
            return;
        let member = new ProxyConnection_1.ProxyConnection(this._ws, memberID);
        this.clients[memberID] = member;
        this.emit("connection", member);
    }
    handelMemberDisconnect(memberID, data) {
        if (!memberID || !(memberID in this.clients))
            return;
        let proxyConnection = this.clients[memberID];
        proxyConnection.receiveClose(parseInt(data));
        delete this.clients[memberID];
    }
    handelMemberMessage(memberID, data) {
        if (!memberID || !(memberID in this.clients))
            return;
        let proxyConnection = this.clients[memberID];
        proxyConnection.receiveMessage(data);
    }
}
exports.ProxyServer = ProxyServer;
//# sourceMappingURL=ProxyServer.js.map