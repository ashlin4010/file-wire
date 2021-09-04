/// <reference types="node" />
import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
declare type MessageListener = (data: any) => void;
export declare interface ProxyClient {
    on(event: 'message', listener: MessageListener): this;
    onmessage?: MessageListener;
}
export declare class ProxyClient extends EventEmitter {
    private readonly _ws;
    constructor(webSocket: WebSocket);
    handleMessage(rawData: any): void;
    send(message: any): void;
}
export {};
