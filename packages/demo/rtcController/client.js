// connection will not reconnect if the scrip is restated this is because
// the host does not handle each client just the first

const {WsDuplex, RTCConnection } = require("rtc-connection");
const { DomainConnection } = require("ws-domain");
const { RTCController } = require("rtc-controller");
const { FileSystemInterface } = require("common-file-system");

let url = "ws://127.0.0.1:8080";
let isServer = false;
let isInitiator = !isServer;
let domain = "testing";
let domainConnection;

function log(...data) {
    console.log("[Client]:", ...data);
}

try{
    domainConnection = new DomainConnection(url, domain, isServer ? "token" : undefined);
} catch (e) {
    log("Websocket connection failed to be established, the target might not be online");
    return;
}

domainConnection.on("connect", async (wsProxy) => {
    let ws;
    if(isServer) ws = await new Promise((resolve, reject) => wsProxy.on("connection", resolve));
    else ws = wsProxy;

    let wsDuplex = new WsDuplex(ws);
    let fs = new FileSystemInterface();
    let rtc = new RTCConnection(wsDuplex, isInitiator , {});
    let controller = new RTCController(rtc, isServer, isInitiator, fs);

    rtc.on("connect", () => log("RTC open!"));

    controller.on("control", async (channel) => {
        log("Control open!");

        // working
        let files = await controller.getFiles("./");
        log(files);
        let deleted = await controller.deleteDirectory("./test");
        files = await controller.getFiles("./");
        log(files);
        log(deleted);
    });
});
