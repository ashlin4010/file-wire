"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainPayload_1 = require("./DomainPayload");
const uuid_1 = require("uuid");
class Domain {
    constructor(domainAddress) {
        this.address = domainAddress;
        this.lord = null;
        this.membersByWs = new Map();
        this.membersById = new Map();
    }
    setLord(ws) {
        var _a;
        // close connection with existing lord if one exists
        // this could be dangerous, you could potentially intercept
        // connections as they get made but only if you have a valid token
        if (this.lord)
            this.lord.onmessage = null;
        (_a = this.lord) === null || _a === void 0 ? void 0 : _a.close();
        this.lord = ws;
        this.lord.onmessage = this.handleLordMessage.bind(this);
        // when the lord disconnects disconnect all members
        ws.onclose = () => {
            this.lord = null;
            this.membersById.forEach(({ ws }, id) => ws.close());
            this.membersById.clear();
            this.membersByWs.clear();
        };
    }
    addMember(ws) {
        var _a;
        let id = uuid_1.v4();
        this.membersByWs.set(ws, { id, ws });
        this.membersById.set(id, { id, ws });
        ws.onmessage = this.handleMemberMessage.bind(this);
        // inform server of connection and disconnect
        (_a = this.lord) === null || _a === void 0 ? void 0 : _a.send(DomainPayload_1.DomainPayload.createConnectPayload(id));
        ws.onclose = ({ code }) => {
            var _a;
            this.membersByWs.delete(ws);
            this.membersById.delete(id);
            (_a = this.lord) === null || _a === void 0 ? void 0 : _a.send(DomainPayload_1.DomainPayload.createDisconnectPayload(code, id));
        };
    }
    handleMemberMessage(event) {
        var _a, _b;
        // ony message events
        let payload = DomainPayload_1.DomainPayload.parserPayload(event.data);
        let id = (_a = this.membersByWs.get(event.target)) === null || _a === void 0 ? void 0 : _a.id;
        let { type, data } = payload;
        switch (type) {
            case DomainPayload_1.PayloadType.MESSAGE:
                (_b = this.lord) === null || _b === void 0 ? void 0 : _b.send(DomainPayload_1.DomainPayload.createMessagePayload(data, id));
                break;
        }
    }
    handleLordMessage(event) {
        var _a;
        // message and disconnect events
        let payload = DomainPayload_1.DomainPayload.parserPayload(event.data);
        let { type, data, id } = payload;
        if (!id)
            return;
        let ws = (_a = this.membersById.get(id)) === null || _a === void 0 ? void 0 : _a.ws;
        switch (type) {
            case DomainPayload_1.PayloadType.MESSAGE:
                ws === null || ws === void 0 ? void 0 : ws.send(DomainPayload_1.DomainPayload.createMessagePayload(data, id));
                break;
            case DomainPayload_1.PayloadType.DISCONNECT:
                ws === null || ws === void 0 ? void 0 : ws.close(data);
        }
    }
}
exports.default = Domain;
