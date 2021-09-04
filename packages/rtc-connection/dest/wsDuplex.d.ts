/// <reference types="node" />
import { CloseListener, DataListener, Duplex, DuplexState } from "./Duplex";
import * as EventEmitter from "events";
export default class WsDuplex extends EventEmitter implements Duplex {
    state: DuplexState;
    ondata?: DataListener | null;
    onclose?: CloseListener | null;
    ws: any;
    constructor(ws: any);
    write(data: any): void;
    handleMessage(message: any): void;
    handleClose(code: number, reason: string): void;
}
