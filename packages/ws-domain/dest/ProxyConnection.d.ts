/// <reference types="node" />
import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
declare type MessageListener = (data: any) => void;
declare type CloseListener = (code?: number) => void;
export declare interface ProxyConnection {
    on(event: 'message', listener: MessageListener): this;
    on(event: 'close', listener: CloseListener): this;
    onmessage?: MessageListener;
    onclose?: CloseListener;
}
export declare class ProxyConnection extends EventEmitter {
    private readonly _ws;
    readonly id: string;
    constructor(webSocket: WebSocket, id: string);
    receiveClose(code?: number): void;
    receiveMessage(data: any): void;
    close(code?: number): void;
    send(data: any): void;
}
export {};
