/// <reference types="node" />
export declare enum PayloadType {
    "MESSAGE" = 0,
    "CONNECT" = 1,
    "DISCONNECT" = 2
}
export declare class DomainPayload {
    type: PayloadType;
    data: any | null;
    id: string | null;
    constructor(type: PayloadType, data: any | null, clientId?: string);
    static parserPayload(string: string | Buffer | ArrayBuffer | Buffer[]): DomainPayload;
    toString(): string;
    static createMessagePayload(data: any, clientId?: string): string;
    static createConnectPayload(clientId: string): string;
    static createDisconnectPayload(code: number | undefined | null, clientId: string): string;
}
