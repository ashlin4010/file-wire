"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainConnection = void 0;
const EventWebSocket_1 = require("./EventWebSocket");
const events_1 = __importDefault(require("events"));
const build_url_1 = __importDefault(require("build-url"));
const ProxyClient_1 = require("./ProxyClient");
const ProxyServer_1 = require("./ProxyServer");
class DomainConnection extends events_1.default {
    constructor(url, domain, token) {
        super();
        this.isLord = !!token;
        this._token = token;
        this.domain = domain;
        this.url = url;
        let fullURL = build_url_1.default(url, {
            path: domain,
            queryParams: token ? { "token": token } : undefined
        });
        this._ws = new EventWebSocket_1.EventWebSocket(fullURL);
        this._ws.onopen = this.handleOpen.bind(this);
        this._ws.onclose = this.handleClose.bind(this);
        this._ws.onerror = this.handleError.bind(this);
    }
    handleOpen() {
        // @ts-ignore
        let proxy = this.isLord ? new ProxyServer_1.ProxyServer(this._ws) : new ProxyClient_1.ProxyClient(this._ws);
        if (this.onconnect)
            this.onconnect(proxy);
        this.emit("connect", proxy);
    }
    handleClose(code, reason) {
        if (this.ondisconnect)
            this.ondisconnect(code, reason);
        this.emit("disconnect", code, reason);
    }
    handleError() {
        if (this.onerror)
            this.onerror();
        this.emit("error");
    }
}
exports.DomainConnection = DomainConnection;
