export class RTCController {

    isServer: boolean;
    isInitiator: boolean;
    fs: any

    constructor(server: boolean, initiator: boolean, configuration: any, fileSystem: any) {
        this.isServer = server;
        this.isInitiator = initiator;
        this.fs = fileSystem;
    }
}