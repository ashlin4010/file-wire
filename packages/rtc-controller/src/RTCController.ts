import * as EventEmitter from "events";
import type { RTCConnection } from "rtc-connection";
import { ReqResChannel } from "./ReqResChannel";
import * as Path from "path";

const CONTROL_CHANNEL_LABEL = "CONTROL";

enum ControlCommand {
    "LIST_DIRECTORY",
    "DELETE_FILE",
    "DELETE_DIRECTORY",
    "CREATE_FILE",
    "CREATE_DIRECTORY",
    "RENAME",
    "LIST_FILE_CHANNEL",
    "CLOSE_FILE_CHANNEL",
    "OPEN_FILE_CHANNEL",
    "CLOSE_CONNECTION",
}

enum ControlStatusCodes {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500
}

export interface RTCController {
    constructor(rtc: RTCConnection, isServer: boolean, isInitiator: boolean, fileSystem: any): RTCController
    on(event: string, listener: Function): this;
    on(event: 'control', listener: (channel: ReqResChannel) => void): this;
    on(event: 'disconnect', listener: (name: string) => void): this;
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

        this.rtc.on("disconnect", () => this.emit("disconnect"));

        if(isInitiator) this.createControlChannel();

    }

    close(): void {
        this.rtc?.close();
    }

    // handle new data channels including control channel
    private handleDataChannel(channel: RTCDataChannel) {
        if(channel.label === CONTROL_CHANNEL_LABEL) {
            let controlChannel = this.controlChannel = new ReqResChannel(channel, true);
            controlChannel.channel.addEventListener("open", () => {
                this.emit("control", controlChannel);
            });

            controlChannel.on("message", this.handleDataChannelCommand.bind(this));
        }
    }

    // handle commands
    private handleDataChannelCommand({command, data}: {command: ControlCommand, data: any}, send: (data: any) => void) {
        let fs = this.fs;

        // list directory content
        function listDirectory(send: Function, command: ControlCommand, data: {path: string} | undefined) {
            if (data?.path) {
                fs.readdir(data.path)
                    .then((files: string[]) => {
                        let pending: Promise<object>[] = [];
                        files.forEach(file => {
                            pending.push(fs.stat(Path.join(data.path, file)));
                        });
                        Promise.all(pending).then((files) => {
                            send({code: ControlStatusCodes.OK, data: files});
                        });
                    })
                    .catch((e:any) => {send({code: ControlStatusCodes.INTERNAL_SERVER_ERROR})});
            } else send({code: ControlStatusCodes.BAD_REQUEST});
        }

        // delete directory
        function deleteDirectory(send: Function, command: ControlCommand, data: {path: string} | undefined) {
            if (data?.path) {
                fs.rmdir(data.path)
                    .then((files: any) => send({code: ControlStatusCodes.OK, data: files}))
                    .catch((err: any) => send({code: ControlStatusCodes.INTERNAL_SERVER_ERROR, message: err}));
            } else send({code: ControlStatusCodes.BAD_REQUEST});
        }

        // delete file
        function deleteFile(send: Function,command: ControlCommand, data: {path: string} | undefined) {
            if (data?.path) {
                fs.rm(data.path)
                    .then((files: any) => send({code: ControlStatusCodes.OK, data: files}))
                    .catch((err: any) => send({code: ControlStatusCodes.INTERNAL_SERVER_ERROR, message: err}));
            } else send({code: ControlStatusCodes.BAD_REQUEST});
        }

        // rename
        function rename(send: Function,command: ControlCommand, data: {path: string} | undefined) {

        }


        switch (command) {
            case ControlCommand.LIST_DIRECTORY: listDirectory(send, command, data); break;
            case ControlCommand.DELETE_DIRECTORY: deleteDirectory(send, command, data); break;
            case ControlCommand.DELETE_FILE: deleteFile(send, command, data); break;
        }
    }


    private createControlChannel(): ReqResChannel {
        let controlChannel = new ReqResChannel(this.rtc.createDataChannel(CONTROL_CHANNEL_LABEL));
        controlChannel.channel.addEventListener("open", () => {
            this.emit("control", controlChannel);
        });
        return this.controlChannel = controlChannel;
    }

    // send commands
    sendCommand(command: ControlCommand | string, data: any) {
        if(!this.controlChannel) throw "Control channel has yet to be established";
        return this.controlChannel.send({ command, data });
    }

    getFiles(path: string) {
        return this.sendCommand(ControlCommand.LIST_DIRECTORY, {path: path});
    }

    deleteFile(path: string) {
        return this.sendCommand(ControlCommand.DELETE_FILE, {path: path});
    }

    deleteDirectory(path: string) {
        return this.sendCommand(ControlCommand.DELETE_DIRECTORY, {path: path});
    }

}