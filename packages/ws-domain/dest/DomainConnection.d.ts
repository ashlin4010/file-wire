/// <reference types="node" />
import EventEmitter from "events";
import { ProxyConnection } from "./ProxyConnection";
declare type ConnectionListener = (ws: ProxyConnection) => void;
declare type MessageListener = (data: any) => void;
interface Proxy {
    on(event: 'connection', listener: ConnectionListener): this;
    on(event: 'message', listener: MessageListener): this;
    onconnect?: ConnectionListener;
    onmessage?: MessageListener;
    send(data: any): void;
}
declare type ErrorListener = () => void;
declare type ConnectListener = (proxy: Proxy) => void;
declare type DisconnectListener = (code: number, reason: string) => void;
export declare interface DomainConnection {
    on(event: 'error', listener: ErrorListener): this;
    on(event: 'connect', listener: ConnectListener): this;
    on(event: 'disconnect', listener: DisconnectListener): this;
    onerror?: ErrorListener;
    onconnect?: ConnectListener;
    ondisconnect?: DisconnectListener;
}
export declare class DomainConnection extends EventEmitter {
    private readonly _ws;
    private readonly _token?;
    readonly isLord: boolean;
    readonly domain: string;
    readonly url: string;
    constructor(url: string, domain: string, token?: string);
    private handleOpen;
    private handleClose;
    private handleError;
}
export {};
