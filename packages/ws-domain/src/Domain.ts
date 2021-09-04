import { DomainPayload, PayloadType } from "./DomainPayload";
import { v4 as uuid } from 'uuid';

export default class Domain {
    address: string;
    lord: WebSocket | null;
    membersByWs: Map<WebSocket,{id: string, ws: WebSocket}>
    membersById: Map<string,{id: string, ws: WebSocket}>

    constructor(domainAddress: string) {
        this.address = domainAddress;
        this.lord = null;
        this.membersByWs = new Map();
        this.membersById = new Map();
    }

    setLord(ws: WebSocket): void {
        // close connection with existing lord if one exists
        // this could be dangerous, you could potentially intercept
        // connections as they get made but only if you have a valid token
        if(this.lord) this.lord.onmessage = null;
        this.lord?.close();
        this.lord = ws;
        this.lord.onmessage = this.handleLordMessage.bind(this);


        // when the lord disconnects disconnect all members
        ws.onclose = () => {
            this.lord = null;
            this.membersById.forEach(({ws}, id) => ws.close());
            this.membersById.clear();
            this.membersByWs.clear();
        };
    }

    addMember(ws: WebSocket): void {
        let id = uuid();
        this.membersByWs.set(ws, {id, ws});
        this.membersById.set(id, {id, ws});

        ws.onmessage = this.handleMemberMessage.bind(this);

        // inform server of connection and disconnect
        this.lord?.send(DomainPayload.createConnectPayload(id));
        ws.onclose = ({code}) => {
            this.membersByWs.delete(ws);
            this.membersById.delete(id);
            this.lord?.send(DomainPayload.createDisconnectPayload(code, id));
        };
    }

    private handleMemberMessage(event: any) {
        // ony message events
        let payload = DomainPayload.parserPayload(event.data);
        let id = this.membersByWs.get(event.target)?.id;
        let {type, data} = payload;

        switch (type) {
            case PayloadType.MESSAGE:
                this.lord?.send(DomainPayload.createMessagePayload(data, id));
                break;
        }
    }

    private handleLordMessage(event: any) {
        // message and disconnect events
        let payload = DomainPayload.parserPayload(event.data);
        let {type, data, id} = payload;
        if(!id) return;
        let ws = this.membersById.get(id)?.ws;

        switch (type) {
            case PayloadType.MESSAGE:
                ws?.send(DomainPayload.createMessagePayload(data, id));
                break;
            case PayloadType.DISCONNECT:
                ws?.close(data);
        }
    }
}