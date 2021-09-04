/// <reference types="node" />
import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
import { ProxyConnection } from "./ProxyConnection";
declare type ConnectionListener = (ws: ProxyConnection) => void;
declare type MessageListener = (data: any) => void;
export declare interface ProxyServer {
    on(event: 'connection', listener: ConnectionListener): this;
    on(event: 'message', listener: MessageListener): this;
    onconnect?: ConnectionListener;
    onmessage?: MessageListener;
}
export declare class ProxyServer extends EventEmitter {
    private readonly _ws;
    clients: {
        [id: string]: ProxyConnection;
    };
    constructor(webSocket: WebSocket);
    private handleMessage;
    private handleMemberConnect;
    private handelMemberDisconnect;
    private handelMemberMessage;
}
export {};
