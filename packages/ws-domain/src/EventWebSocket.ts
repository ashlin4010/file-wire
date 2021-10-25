import WebSocket from "isomorphic-ws";

type MessageData = string | Buffer | ArrayBuffer | Buffer[];

type OpenListener =     () => void;
type CloseListener =    (code: number, reason: string) => void;
type ErrorListener =    (error: any) => void;
type MessageListener =  (data: MessageData) => void;

export declare interface EventWebSocket {
    on(event: 'open', listener: OpenListener): this;
    on(event: 'close', listener: CloseListener): this;
    on(event: 'error', listener: ErrorListener): this;
    on(event: 'message', listener: MessageListener): this;

    addEventListener(event: 'open', listener: OpenListener): this;
    addEventListener(event: 'close', listener: CloseListener): this;
    addEventListener(event: 'error', listener: ErrorListener): this;
    addEventListener(event: 'message', listener: MessageListener): this;

    onopen?: OpenListener;
    onerror?: ErrorListener;

    close: (code?: Number, reason?: String) => void;
    send: (data: MessageData) => void;
}

export class EventWebSocket extends WebSocket {

    constructor(address: string | URL, protocols?: string | string[], options?: WebSocket.ClientOptions){
        super(address, protocols, options);
    }

    set onclose(listener: CloseListener | undefined | null) {
        if(listener) super.onclose = (typeof window === 'undefined') ? listener : ({code, reason}: any) => listener(code, reason);
        else super.onmessage = undefined;
    }

    set onmessage(listener: MessageListener | undefined | null) {
        if(listener) super.onmessage = (typeof window === 'undefined') ? listener : ({data}: any) => listener(data);
        else super.onmessage = undefined;
    }

    bindEventListener(event: string, listener: Function) {
        if (typeof window === 'undefined') { // node js
            super.on(event, listener);
        } else { // web js
            let eventListener = listener;
            if(event === "close") eventListener = ({code, reason}: any) => listener(code, reason);
            if(event === "message") eventListener = ({data}: any) => listener(data);
            super.addEventListener(event, eventListener);
        }
    }

    on(event: string, listener: Function): this {
        this.bindEventListener(event, listener);
        return this;
    }

    addEventListener(event: string, listener: Function): this {
        this.bindEventListener(event, listener);
        return this;
    }
}