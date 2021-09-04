"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTCConnection = void 0;
var WebRTC = require("wrtc");
var EventEmitter = require("events");
var RTCPeerConnection = WebRTC.RTCPeerConnection;
var RTCConnection = /** @class */ (function (_super) {
    __extends(RTCConnection, _super);
    function RTCConnection(duplex, initiator, configuration) {
        var _this = _super.call(this) || this;
        _this.duplex = duplex;
        _this.initiator = initiator || false;
        _this.configuration = configuration || {
            'iceServers': [
                {
                    'urls': 'stun:stun.l.google.com:19302'
                }
            ]
        };
        _this.duplex.on("data", _this.handleDuplexData.bind(_this));
        // @ts-ignore
        _this.RTCPeerConnection = new RTCPeerConnection(_this.configuration);
        console.log(_this.RTCPeerConnection);
        _this.RTCPeerConnection.ondatachannel = _this.handleDataChannel.bind(_this);
        _this.RTCPeerConnection.onconnectionstatechange = _this.handleConnectionStateChange.bind(_this);
        _this.RTCPeerConnection.onsignalingstatechange = _this.handleSignalingStateChange.bind(_this);
        _this.RTCPeerConnection.onicecandidate = _this.handleIceCandidate.bind(_this);
        _this.RTCPeerConnection.onnegotiationneeded = _this.handleNegotiationNeeded.bind(_this);
        return _this;
    }
    RTCConnection.prototype.handleDuplexData = function (data) {
        var _this = this;
        if (data.type === 'offer') {
            this.RTCPeerConnection.setRemoteDescription(data).catch(console.error);
            this.RTCPeerConnection.createAnswer().then(function (description) {
                _this.RTCPeerConnection.setLocalDescription(description).then(function () {
                    _this.duplex.write(_this.RTCPeerConnection.localDescription);
                }).catch(console.error);
            }).catch(console.error);
        }
        else if (data.type === 'answer') {
            this.RTCPeerConnection.setRemoteDescription(data).catch(console.error);
        }
        else if (data.type === 'candidate') {
            this.RTCPeerConnection.addIceCandidate(data.candidate).catch(console.error);
        }
    };
    RTCConnection.prototype.handleDataChannel = function (_a) {
        var channel = _a.channel;
        this.emit("datachannel", channel);
    };
    RTCConnection.prototype.handleConnectionStateChange = function () {
        console.log("Connection state:", this.RTCPeerConnection.connectionState);
        if (this.RTCPeerConnection.connectionState === "disconnected")
            this.close();
        if (this.RTCPeerConnection.connectionState === "failed")
            this.close();
    };
    RTCConnection.prototype.handleSignalingStateChange = function () {
        if (this.RTCPeerConnection.signalingState === "stable") {
            this.emit("connect");
        }
    };
    RTCConnection.prototype.handleIceCandidate = function (_a) {
        var candidate = _a.candidate;
        if (candidate && candidate.candidate) {
            this.duplex.write({
                type: 'candidate',
                label: candidate.sdpMLineIndex,
                id: candidate.sdpMid,
                candidate: candidate
            });
        }
    };
    RTCConnection.prototype.handleNegotiationNeeded = function () {
        var _this = this;
        console.log("negotiation needed");
        // start negotiation
        this.RTCPeerConnection.createOffer().then(function (SDP_offer) {
            _this.RTCPeerConnection.setLocalDescription(SDP_offer).then(function () {
                _this.duplex.write(_this.RTCPeerConnection.localDescription);
            }).catch(console.error);
        }).catch(console.error);
    };
    RTCConnection.prototype.addDataChannel = function (label) {
        // add channel
        console.log("add chanel");
        var channel = this.RTCPeerConnection.createDataChannel(label);
        channel.onerror = function (e) {
            console.log(e);
        };
    };
    RTCConnection.prototype.close = function () {
        // Object.values(this.dataChannels).forEach(channel => {
        //     channel.close();
        // });
        this.RTCPeerConnection.close();
        this.RTCPeerConnection.ondatachannel = null;
        this.RTCPeerConnection.onconnectionstatechange = null;
        this.RTCPeerConnection.onsignalingstatechange = null;
        this.RTCPeerConnection.onicecandidate = null;
        this.RTCPeerConnection.onnegotiationneeded = null;
        this.emit("disconnect");
    };
    ;
    return RTCConnection;
}(EventEmitter));
exports.RTCConnection = RTCConnection;
//# sourceMappingURL=RTCConnection.js.map