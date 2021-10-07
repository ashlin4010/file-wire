export enum PayloadType {
    "MESSAGE",
    "CONNECT",
    "DISCONNECT"
}

export class DomainPayload {

    type: PayloadType;
    data: any | null;
    id: string | null;

    constructor(type: PayloadType, data: any | null, clientId?: string) {
        this.type = type;
        this.data = data;
        this.id = clientId || null;
    }

    static parserPayload(string: string | Buffer | ArrayBuffer | Buffer[]): DomainPayload {
        let payload = JSON.parse(string.toString());
        return new DomainPayload(payload.type, payload.data, payload.id);
    }

    toString(): string {
        return JSON.stringify({type: this.type, data: this.data, id: this.id});
    }

    static createMessagePayload(data: any, clientId?: string): string {
        return new DomainPayload(PayloadType.MESSAGE, data, clientId).toString();
    }

    static createConnectPayload(clientId: string): string {
        return new DomainPayload(PayloadType.CONNECT, null, clientId).toString();
    }

    static createDisconnectPayload(code: number | undefined | null, clientId?: string): string {
        return new DomainPayload(PayloadType.DISCONNECT, code, clientId).toString();
    }

}