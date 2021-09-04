"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventWebSocket = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
class EventWebSocket extends isomorphic_ws_1.default {
    constructor(address, protocols, options) {
        super(address, protocols, options);
    }
    set onclose(listener) {
        if (listener)
            super.onclose = (typeof window === 'undefined') ? listener : ({ code, reason }) => listener(code, reason);
        else
            super.onmessage = undefined;
    }
    set onmessage(listener) {
        if (listener)
            super.onmessage = (typeof window === 'undefined') ? listener : ({ data }) => listener(data);
        else
            super.onmessage = undefined;
    }
    bindEventListener(event, listener) {
        if (typeof window === 'undefined') { // node js
            super.on(event, listener);
        }
        else { // web js
            let eventListener = listener;
            if (event === "close")
                eventListener = ({ code, reason }) => listener(code, reason);
            if (event === "message")
                eventListener = ({ data }) => listener(data);
            super.addEventListener(event, eventListener);
        }
    }
    on(event, listener) {
        this.bindEventListener(event, listener);
        return this;
    }
    addEventListener(event, listener) {
        this.bindEventListener(event, listener);
        return this;
    }
}
exports.EventWebSocket = EventWebSocket;
