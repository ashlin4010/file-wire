import { Duplex} from "./Duplex";
const WebRTC = require("wrtc");
import * as EventEmitter from "events";

const RTCPeerConnection: RTCPeerConnection = WebRTC.RTCPeerConnection;

export interface RTCConnection {
    new(duplex: Duplex, initiator: boolean, configuration: any): RTCConnection;
    on(event: string, listener: Function): this;
    on(event: 'datachannel', listener: (channel: RTCDataChannel) => void): this;
    on(event: 'connect', listener: (name: string) => void): this;
    on(event: 'disconnect', listener: (name: string) => void): this;
}

export class RTCConnection extends EventEmitter {
    duplex: Duplex;
    initiator: boolean;
    configuration: any;
    RTCPeerConnection: RTCPeerConnection;

    constructor(duplex: Duplex, initiator: boolean, configuration: any) {
        super();

        this.duplex = duplex;
        this.initiator = initiator || false;

        this.configuration = configuration || {
            'iceServers': [
                {
                    'urls': 'stun:stun.l.google.com:19302'
                }
            ]
        };

        this.duplex.on("data", this.handleDuplexData.bind(this));


        // @ts-ignore
        this.RTCPeerConnection = new RTCPeerConnection(this.configuration);
        this.RTCPeerConnection.ondatachannel = this.handleDataChannel.bind(this);
        this.RTCPeerConnection.onconnectionstatechange = this.handleConnectionStateChange.bind(this);
        this.RTCPeerConnection.onsignalingstatechange = this.handleSignalingStateChange.bind(this);
        this.RTCPeerConnection.onicecandidate = this.handleIceCandidate.bind(this);
        this.RTCPeerConnection.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
        return this;
    }

    private handleDuplexData(data: any): void {
        if (data.type === 'offer') {
            this.RTCPeerConnection.setRemoteDescription(data).catch(console.error);
            this.RTCPeerConnection.createAnswer().then(description => {
                this.RTCPeerConnection.setLocalDescription(description).then(() => {
                    this.duplex.write(this.RTCPeerConnection.localDescription);
                }).catch(console.error);
            }).catch(console.error);
        } else if (data.type === 'answer') {
            this.RTCPeerConnection.setRemoteDescription(data).catch(console.error);
        } else if (data.type === 'candidate') {
            this.RTCPeerConnection.addIceCandidate(data.candidate).catch(console.error);
        }
    }

    private handleDataChannel({ channel }: { channel: RTCDataChannel }): void {
        this.emit("datachannel", channel);
    }

    private handleConnectionStateChange(): void {
        if (this.RTCPeerConnection.connectionState === "disconnected") this.close();
        if (this.RTCPeerConnection.connectionState === "failed") this.close();
    }

    private handleSignalingStateChange(): void {
        if (this.RTCPeerConnection.signalingState === "stable") {
            this.emit("connect");
        }
    }

    private handleIceCandidate({candidate}: RTCPeerConnectionIceEvent): void {
        if (candidate && candidate.candidate) {
            this.duplex.write({
                type: 'candidate',
                label: candidate.sdpMLineIndex,
                id: candidate.sdpMid,
                candidate: candidate
            });
        }
    }

    private handleNegotiationNeeded(): void {
        // start negotiation
        this.RTCPeerConnection.createOffer().then(SDP_offer => {
            this.RTCPeerConnection.setLocalDescription(SDP_offer).then(() => {
                this.duplex.write(this.RTCPeerConnection.localDescription);
            }).catch(console.error);
        }).catch(console.error);
    }


    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit | undefined): RTCDataChannel {
        return this.RTCPeerConnection.createDataChannel(label, dataChannelDict);
    }

    getTransceivers(): Array<RTCRtpTransceiver> {
        return this.RTCPeerConnection.getTransceivers();
    }

    close() {
        this.RTCPeerConnection.close();
        this.RTCPeerConnection.ondatachannel = null;
        this.RTCPeerConnection.onconnectionstatechange = null;
        this.RTCPeerConnection.onsignalingstatechange = null;
        this.RTCPeerConnection.onicecandidate = null;
        this.RTCPeerConnection.onnegotiationneeded = null;
        this.emit("disconnect");
    };
}