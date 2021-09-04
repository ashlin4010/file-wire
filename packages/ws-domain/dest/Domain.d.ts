export default class Domain {
    address: string;
    lord: WebSocket | null;
    membersByWs: Map<WebSocket, {
        id: string;
        ws: WebSocket;
    }>;
    membersById: Map<string, {
        id: string;
        ws: WebSocket;
    }>;
    constructor(domainAddress: string);
    setLord(ws: WebSocket): void;
    addMember(ws: WebSocket): void;
    private handleMemberMessage;
    private handleLordMessage;
}
