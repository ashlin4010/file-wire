import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
import { DomainPayload, PayloadType } from "./DomainPayload";

type MessageListener = (data: any) => void;

export declare interface ProxyClient {
    on(event: 'message', listener: MessageListener): this;
    onmessage?: MessageListener
}

export class ProxyClient extends EventEmitter {

    private readonly _ws: WebSocket;

    constructor(webSocket: WebSocket) {
        super();
        this._ws = webSocket;
        this._ws.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(rawData: any): void {
        let payload = DomainPayload.parserPayload(rawData);
        let {data, type, id} = payload;

        switch (type) {
            case PayloadType.MESSAGE:
                if (this.onmessage) this.onmessage(data);
                this.emit("message", data);
        }
    }

    public send(message: any): void {
        this._ws.send(DomainPayload.createMessagePayload(message))
    }
}