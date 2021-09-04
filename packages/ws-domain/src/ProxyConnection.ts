import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
import { DomainPayload } from "./DomainPayload";


type MessageListener = (data: any) => void;
type CloseListener = (code?: number) => void;

export declare interface ProxyConnection {
    on(event: 'message', listener: MessageListener): this;
    on(event: 'close', listener: CloseListener): this;
    onmessage?: MessageListener;
    onclose?: CloseListener;
}

export class ProxyConnection extends EventEmitter {
    private readonly _ws: WebSocket;
    readonly id: string;

    constructor(webSocket: WebSocket, id: string) {
        super();
        this._ws = webSocket;
        this.id = id;
    }

    receiveClose(code?: number) {
        if (this.onclose) this.onclose(code);
        this.emit("close", code);
    }

    receiveMessage(data: any) {
        if (this.onmessage) this.onmessage(data);
        this.emit("message", data);
    }

    public close(code?: number) {
        this._ws.send(DomainPayload.createDisconnectPayload(code, this.id));
    }

    public send(data: any) {
        this._ws.send(DomainPayload.createMessagePayload(data, this.id))
    }
}