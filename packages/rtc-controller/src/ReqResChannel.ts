import { v4 as uuidv4 } from 'uuid';
import * as EventEmitter from "events";

enum MessageType{
    "REQUEST",
    "RESPONSE"
}

type pendingRequestTable = {
    [id: string]: { resolve: Function, reject: Function }
};

export declare interface ReqResChannel {
    on(event: string, listener: Function): this;
    on(event: 'message', listener: (data: any, send: (data: any) => void) => void): this;
    on(event: 'open', listener: (channel: ReqResChannel) => void): this;
}

export class ReqResChannel extends EventEmitter {
    channel: RTCDataChannel;
    id: number | null;
    label: string;
    pendingRequests: pendingRequestTable;
    isReceiver: boolean;

    constructor(rtcDataChannel: RTCDataChannel, receiver: boolean = false) {
        super()
        this.channel = rtcDataChannel;
        this.id = rtcDataChannel.id;
        this.label = rtcDataChannel.label;
        this.isReceiver = receiver;
        this.pendingRequests = {};
        this.channel.onmessage = this.handleMessage.bind(this);
        this.channel.onopen = this.handleOpen.bind(this);
    }

    handleOpen(ev: Event): void {
        this.emit("open", this);
    }

    handleMessage(e: MessageEvent) {
        let {id, data, type} = JSON.parse(e.data);
        if(this.isReceiver) {
            this.emit("message", data, (data: any) => {
                this.channel.send(JSON.stringify({id, type: MessageType.RESPONSE, data}));
            });
        } else {
            let promise = this.pendingRequests[id];
            if(!promise || type !== MessageType.RESPONSE){
                console.log("Unsolicited message", e.data);
                return;
            }
            promise.resolve(data);
        }
    }

    send(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                let id = uuidv4();
                this.channel.send(JSON.stringify({id, type: MessageType.REQUEST, data}));
                this.pendingRequests[id] = {resolve, reject};
            } catch (e) {
                reject(e);
            }
        });
    }
}