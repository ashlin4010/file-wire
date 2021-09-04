import WebSocket from "isomorphic-ws";
import Domain from "./Domain";

export class WebSocketDomainServer {
    private _wss: WebSocket.Server;
    clients: Array<WebSocket> = [];
    domains: Record<string, Domain> = {};

    constructor() {
        this._wss = new WebSocket.Server({ noServer: true });
    }

    handleUpgrade(request: any, socket: any, head: any, cb: (client: WebSocket) => void) {
        this._wss.handleUpgrade(request, socket, head, (webSocket: WebSocket, request: any) => {
            this.clients.push(webSocket);
            cb(webSocket);
        });
    }

    getDomain(domainAddress: string): Domain | null {
        return this.domains[domainAddress] || null;
    }

    createDomain(domainAddress: string): Domain {
        return this.domains[domainAddress] = new Domain(domainAddress);
    }
}