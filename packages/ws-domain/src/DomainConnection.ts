import { EventWebSocket } from "./EventWebSocket";
import EventEmitter from "events";
import buildUrl from 'build-url';
import { ProxyClient } from "./ProxyClient";
import { ProxyServer } from "./ProxyServer";
import {ProxyConnection} from "./ProxyConnection";

type ConnectionListener = (ws: ProxyConnection) => void;
type MessageListener = (data: any) => void;

export interface Proxy {
    on(event: 'connection', listener: ConnectionListener): this;
    on(event: 'message', listener: MessageListener): this;
    onconnect?: ConnectionListener;
    onmessage?: MessageListener;
    send(data: any): void;
}

type ErrorListener = (error: any) => void;
type ConnectListener = (proxy: Proxy) => void;
type DisconnectListener = (code: number, reason: string) => void;

export declare interface DomainConnection {
    on(event: 'error', listener: ErrorListener): this;
    on(event: 'connect', listener: ConnectListener): this;
    on(event: 'disconnect', listener: DisconnectListener): this;

    onerror?: ErrorListener;
    onconnect?: ConnectListener;
    ondisconnect?: DisconnectListener;
}

export class DomainConnection extends EventEmitter {

    private readonly _ws: EventWebSocket;
    private readonly _token?: string;
    readonly isLord: boolean;
    public readonly domain: string;
    public readonly url: string;

    constructor(url: string, domain: string, token?: string) {
        super();
        this.isLord = !!token;
        this._token = token;
        this.domain = domain;
        this.url    = url;

        let fullURL = buildUrl(url, {
            path: domain,
            queryParams: token? {"token": token} : undefined
        });

        this._ws = new EventWebSocket(fullURL);

        this._ws.onopen = this.handleOpen.bind(this);
        this._ws.onclose = this.handleClose.bind(this);
        this._ws.onerror = this.handleError.bind(this);
    }

    private handleOpen(): void {
        // @ts-ignore
        let proxy: Proxy = this.isLord ? new ProxyServer(this._ws) : new ProxyClient(this._ws);
        if (this.onconnect) this.onconnect(proxy);
        this.emit("connect", proxy);
    }

    private handleClose(code: number, reason: string): void {
        if (this.ondisconnect) this.ondisconnect(code, reason);
        this.emit("disconnect", code, reason);
    }

    private handleError(err: any): void {
        if (this.onerror) this.onerror(err);
        this.emit("error", err);
    }

}