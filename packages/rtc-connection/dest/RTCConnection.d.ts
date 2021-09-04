/// <reference types="node" />
import { Duplex } from "./Duplex";
import * as EventEmitter from "events";
export declare interface RTCConnection {
    on(event: string, listener: Function): this;
    on(event: 'datachannel', listener: (name: string) => void): this;
    on(event: 'connect', listener: (name: string) => void): this;
    on(event: 'disconnect', listener: (name: string) => void): this;
}
export declare class RTCConnection extends EventEmitter {
    duplex: Duplex;
    initiator: boolean;
    configuration: any;
    RTCPeerConnection: RTCPeerConnection;
    constructor(duplex: Duplex, initiator: boolean, configuration: any);
    private handleDuplexData;
    private handleDataChannel;
    private handleConnectionStateChange;
    private handleSignalingStateChange;
    private handleIceCandidate;
    private handleNegotiationNeeded;
    addDataChannel(label: string): void;
    close(): void;
}
