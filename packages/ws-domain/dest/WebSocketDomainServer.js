"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketDomainServer = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const Domain_1 = __importDefault(require("./Domain"));
class WebSocketDomainServer {
    constructor() {
        this.clients = [];
        this.domains = {};
        this._wss = new isomorphic_ws_1.default.Server({ noServer: true });
    }
    handleUpgrade(request, socket, head, cb) {
        this._wss.handleUpgrade(request, socket, head, (webSocket, request) => {
            this.clients.push(webSocket);
            cb(webSocket);
        });
    }
    getDomain(domainAddress) {
        return this.domains[domainAddress] || null;
    }
    createDomain(domainAddress) {
        return this.domains[domainAddress] = new Domain_1.default(domainAddress);
    }
}
exports.WebSocketDomainServer = WebSocketDomainServer;
//# sourceMappingURL=WebSocketDomainServer.js.map