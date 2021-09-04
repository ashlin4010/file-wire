import WebSocket from "isomorphic-ws";
import Domain from "./Domain";
export declare class WebSocketDomainServer {
    private _wss;
    clients: Array<WebSocket>;
    domains: Record<string, Domain>;
    constructor();
    handleUpgrade(request: any, socket: any, head: any, cb: (client: WebSocket) => void): void;
    getDomain(domainAddress: string): Domain | null;
    createDomain(domainAddress: string): Domain;
}
