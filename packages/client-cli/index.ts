import { DomainConnection } from "ws-domain";
import { FileSystemInterface } from "common-file-system";
import { RTCConnection, WsDuplex } from "rtc-connection";
import { RTCController } from "rtc-controller";

let url = "ws://127.0.0.1:8080";
let isServer = true;
let isInitiator = !isServer;
let domain = "testing";
let domainConnection;

log("Connecting to signalling server...");
tryConnect().then(async (wsProxy) => {
    log("Connected to signalling server.");
    let ws = !isServer ? wsProxy : await new Promise((resolve, reject) => wsProxy.on("connection", resolve));
    let wsDuplex = new WsDuplex(ws);

    let fs = new FileSystemInterface("./");
    let rtc = new RTCConnection(wsDuplex, isInitiator, {});
    let controller = new RTCController(rtc, isServer, isInitiator, fs);

    rtc.on("connect", () => log("RTC open!"));

    controller.on("control", (channel) => {
        log("Control open!");

        channel.on("message", (message, send) => {
            log(message);
        });
    });
}).catch(() => {
    log("Failed to connect to signalling server, stopping");
    process.exit(0);
});


function log(...data: any) {
    console.log("[Host]:", ...data);
}

function tryConnect(maxRetries: number = 5): Promise<any>  {
    return new Promise((resolve, reject) => {

        let attempt = 0;
        let retry = setInterval(() => {

            domainConnection = new DomainConnection(url, domain, isServer ? "token" : undefined);
            domainConnection.on("error", (err) => {
                attempt += 1;
                log("Websocket connection failed to be established, the target might not be online, retrying in 1 second");
                if(attempt > maxRetries) reject("Websocket connection failed to be established");
            });

            domainConnection.on("connect", async (wsProxy) => {
                clearInterval(retry);
                resolve(wsProxy);
            });
        }, 1000);
    });
}
