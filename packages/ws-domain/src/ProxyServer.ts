import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
import { ProxyConnection } from "./ProxyConnection";
import {DomainPayload, PayloadType} from "./DomainPayload";

type ConnectionListener = (ws: ProxyConnection) => void;
type MessageListener = (data: any) => void;

export declare interface ProxyServer {
    on(event: 'connection', listener: ConnectionListener): this;
    on(event: 'message', listener: MessageListener): this;
    onconnect?: ConnectionListener;
    onmessage?: MessageListener;
}

export class ProxyServer extends EventEmitter {

    private readonly _ws: WebSocket;
    clients: {[id: string]: ProxyConnection} = {};

    constructor(webSocket: WebSocket) {
        super();
        this._ws = webSocket;
        this._ws.onmessage = this.handleMessage.bind(this);
    }


    private handleMessage(rawData: string): void {
        let payload = DomainPayload.parserPayload(rawData);
        let {data, type, id} = payload;

        switch (type) {
            case PayloadType.CONNECT:
                this.handleMemberConnect(id);
                break;
            case PayloadType.DISCONNECT:
                this.handelMemberDisconnect(id, data);
                break;
            case PayloadType.MESSAGE:
                this.handelMemberMessage(id, data);
                break;
        }
    }

    private handleMemberConnect(memberID: string | null): void {
        if(!memberID) return;
        let member = new ProxyConnection(this._ws, memberID);
        this.clients[memberID] = member;
        this.emit("connection", member);
    }

    private handelMemberDisconnect(memberID: string | null, data?: any): void {
        if(!memberID || !(memberID in this.clients)) return;
        let proxyConnection = this.clients[memberID];
        proxyConnection.receiveClose(parseInt(data));
        delete this.clients[memberID];
    }

    private handelMemberMessage(memberID: string | null, data: any): void {
        if(!memberID || !(memberID in this.clients)) return;
        let proxyConnection = this.clients[memberID];
        proxyConnection.receiveMessage(data);
    }

}