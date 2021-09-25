const {WsDuplex, RTCConnection } = require("rtc-connection");
const { DomainConnection } = require("ws-domain");
const { RTCController } = require("rtc-controller");
const { FileSystemInterface } = require("common-file-system");

let url = "ws://127.0.0.1:8080";
let isServer = true;
let isInitiator = !isServer;
let domain = "testing";
let domainConnection;

function log(...data) {
    console.log("[Host]:", ...data);
}

try{
    domainConnection = new DomainConnection(url, domain, isServer ? "token" : undefined);
} catch (e) {
    log("Websocket connection failed to be established, the target might not be online");
}


domainConnection.on("connect", async (wsProxy) => {
    let ws;
    if (isServer) ws = await new Promise((resolve, reject) => wsProxy.on("connection", resolve));
    else ws = wsProxy;

    let fs = new FileSystemInterface("./");
    let wsDuplex = new WsDuplex(ws);
    let rtc = new RTCConnection(wsDuplex, isInitiator, {});
    let controller = new RTCController(rtc, isServer, isInitiator, fs);

    rtc.on("connect", () => log("RTC open!"));

    controller.on("control", (channel) => {
        log("Control open!");

        // channel.on("message", (message, send) => {
        //     log(message);
        // });
    });
});


