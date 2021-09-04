"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsDuplex = void 0;
var Duplex_1 = require("./Duplex");
var EventEmitter = require("events");
var WsDuplex = /** @class */ (function (_super) {
    __extends(WsDuplex, _super);
    function WsDuplex(ws) {
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.state = Duplex_1.DuplexState.OPEN;
        _this.ondata = null;
        _this.onclose = null;
        _this.ws.onmessage = _this.handleMessage.bind(_this);
        _this.ws.onclose = _this.handleClose.bind(_this);
        return _this;
    }
    WsDuplex.prototype.write = function (data) {
        if (this.state === Duplex_1.DuplexState.OPEN)
            this.ws.send(data);
        else
            throw "Websocket connection is not open";
    };
    WsDuplex.prototype.handleMessage = function (message) {
        if (this.ondata)
            this.ondata(message);
        this.emit("data", message);
    };
    WsDuplex.prototype.handleClose = function (code, reason) {
        this.state = Duplex_1.DuplexState.CLOSED;
        if (this.onclose)
            this.onclose(code, reason);
        this.emit("data", code, reason);
    };
    return WsDuplex;
}(EventEmitter));
exports.WsDuplex = WsDuplex;
//# sourceMappingURL=WsDuplex.js.map