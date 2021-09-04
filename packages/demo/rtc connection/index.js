const {WsDuplex, RTCConnection } = require("rtc-connection");
const { v4: uuid } = require('uuid');
const { DomainConnection } = require("ws-domain");


let button = document.getElementById("connect");
let checkbox = document.getElementById("checkbox");
window.addEventListener('hashchange', () => window.location.reload());

let [domain, server] =  window.location.hash.substr(1).split("/");
let isServer = Boolean(server);
if(!domain && !isServer) window.location.hash = "#" + (domain = uuid().substr(0,5)) + "/server";
checkbox.checked = !isServer;


button?.addEventListener("click", () => {
    let domainConnection;
    let url = location.origin.replace(/^http/, 'ws');
    let isInitiator = checkbox ? checkbox.checked : false;
    isServer = !isInitiator;
    button.disabled = true;

    try{
        domainConnection = new DomainConnection(url, domain, isServer ? "token" : undefined);
    } catch (e) {
        console.log("Websocket connection failed to be established, the target might not be online");
        button.disabled = false;
        return;
    }


    domainConnection.on("connect", async (wsProxy) => {
        setConnected(1);
        let ws;
        if(isServer) ws = await new Promise((resolve, reject) => wsProxy.on("connection", resolve));
        else ws = wsProxy;

        let wsDuplex = new WsDuplex(ws);
        let RTC = new RTCConnection(wsDuplex, isInitiator , {});

        if(isInitiator) RTC.addDataChannel("plz work");

        RTC.on("connect", () => {
            console.log("RTC open!");
            setConnected(2);
        });
    });

    domainConnection.on("disconnect", () => {
        setConnected(0);
        button.disabled = false;
    });

});


function setConnected(value) {
    let ele = document.getElementById("connected");
    if(value === 0) {
        ele.className = "red";
    } else if (value === 1) {
        ele.className = "yellow";
    } else if (value === 2) {
        ele.className = "green";
    }
}