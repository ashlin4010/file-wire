import {CloseListener, DataListener, Duplex, DuplexState} from "./Duplex";
import * as EventEmitter from "events";

export class WsDuplex extends EventEmitter implements Duplex {

    state: DuplexState;
    ondata?: DataListener | null;
    onclose?: CloseListener | null;
    ws: any;

    constructor(ws: any) {
        super();
        this.ws = ws;
        this.state = DuplexState.OPEN;

        this.ondata = null;
        this.onclose = null;

        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
    }

    write(data: any) {
        if(this.state === DuplexState.OPEN) this.ws.send(data);
        else throw "Websocket connection is not open";
    }

    handleMessage(message: any) {
        if (this.ondata) this.ondata(message);
        this.emit("data", message);
    }

    handleClose(code: number, reason: string) {
        this.state = DuplexState.CLOSED;
        if (this.onclose) this.onclose(code, reason);
        this.emit("data", code, reason);
    }
}