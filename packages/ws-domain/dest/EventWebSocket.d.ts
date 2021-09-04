/// <reference types="node" />
import WebSocket from "isomorphic-ws";
declare type MessageData = string | Buffer | ArrayBuffer | Buffer[];
declare type OpenListener = () => void;
declare type CloseListener = (code: number, reason: string) => void;
declare type ErrorListener = () => void;
declare type MessageListener = (data: MessageData) => void;
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
    close: () => void;
    send: (data: MessageData) => void;
}
export declare class EventWebSocket extends WebSocket {
    constructor(address: string | URL, protocols?: string | string[], options?: WebSocket.ClientOptions);
    set onclose(listener: CloseListener | undefined | null);
    set onmessage(listener: MessageListener | undefined | null);
    bindEventListener(event: string, listener: Function): void;
}
export {};
