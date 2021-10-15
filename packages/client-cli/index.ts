import { DomainConnection } from "ws-domain";
import { FileSystemInterface } from "common-file-system";
import { RTCConnection, WsDuplex } from "rtc-connection";
import { RTCController } from "rtc-controller";

const isProduction = process.env.NODE_ENV === "production";
const serverAdr = process.env.SERVER_ADR;
let url = isProduction ? `wss://${serverAdr}` : "ws://127.0.0.1:8080";

let path = "./testdata"
let isServer = true;
let isInitiator = !isServer;
let domain = "testing";
let domainConnection;

// start client
log("Domain:", domain);
log("URL:", url);
log("Connecting to signalling server...");

tryConnect().then(async (wsProxy) => {
    log("Connected to signalling server");
    if(isServer) {
        wsProxy.on("connection", (ws: any) => {
            log("Client has joint domain")
            let wsDuplex = new WsDuplex(ws);
            let fs = new FileSystemInterface(path);
            let rtc = new RTCConnection(wsDuplex, isInitiator, {
                'iceServers': [
                    {
                        'urls': `stun:stun.filewire.io:3478`
                    },
                    {
                        'urls': 'stun:stun.l.google.com:19302'
                    }
                ]
            });
            let controller = new RTCController(rtc, isServer, isInitiator, fs);

            log("Establishing RTC connection...");
            rtc.on("connect", () => log("RTC connection open"));

            controller.on("control", (channel) => {
                log("Control channel open and ready");
                ws.close();
                // channel.on("message", (message, send) => {
                //     log(message);
                // });
            });
        });
    }

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

            domainConnection.on("disconnect", ((code, reason) => {
                console.log("disconnect from domain,", code, reason);
            }));

        }, 1000);
    });
}
