import * as EventEmitter from "events";
import type { RTCConnection } from "rtc-connection";
import { ReqResChannel } from "./ReqResChannel";

const CONTROL_CHANNEL_LABEL = "CONTROL";

enum ControlCommands {
    "LIST_DIRECTORY",
    "DELETE_FILE",
    "DELETE_DIRECTORY",
    "CREATE_FILE",
    "CREATE_DIRECTORY",
    "LIST_FILE_CHANNEL",
    "CLOSE_FILE_CHANNEL",
    "OPEN_FILE_CHANNEL",
    "CLOSE_CONNECTION",
}

export declare interface RTCController {
    on(event: string, listener: Function): this;
    on(event: 'control', listener: (channel: ReqResChannel) => void): this;
}


export class RTCController extends EventEmitter {

    readonly isServer: boolean;
    readonly isInitiator: boolean;
    readonly fs: any
    rtc: RTCConnection;
    controlChannel: (ReqResChannel | null) = null;

    constructor(rtc: RTCConnection, isServer: boolean, isInitiator: boolean, fileSystem: any) {
        super();
        this.isServer = isServer;
        this.isInitiator = !isServer;
        this.fs = fileSystem;
        this.rtc = rtc;

        // if isInitiator begin connection
        // else await the control channel
        this.rtc.on("datachannel", (channel) => this.handleDataChannel(channel));
        if(isInitiator) this.createControlChannel();
    }

    handleDataChannel(channel: RTCDataChannel) {

        if(channel.label === CONTROL_CHANNEL_LABEL) {
            let controlChannel = this.controlChannel = new ReqResChannel(channel, true);
            controlChannel.channel.addEventListener("open", () => {
                this.emit("control", controlChannel);
            });
        }
    }

    private createControlChannel(): ReqResChannel {
        let controlChannel = new ReqResChannel(this.rtc.createDataChannel(CONTROL_CHANNEL_LABEL));
        controlChannel.channel.addEventListener("open", () => {
            this.emit("control", controlChannel);
        });
        return this.controlChannel = controlChannel;
    }

    sendCommand(command: ControlCommands | string, data: any) {
        if(!this.controlChannel) throw "Control channel has yet to be established";
        return this.controlChannel.send({ command, data });
    }

    getFiles(path: string) {
        return this.sendCommand(ControlCommands.LIST_DIRECTORY, {path: path});
    }

    deleteFile(path: string) {
        return this.sendCommand(ControlCommands.DELETE_FILE, {path: path});
    }

    deleteDirectory(path: string) {
        return this.sendCommand(ControlCommands.DELETE_DIRECTORY, {path: path});
    }

}