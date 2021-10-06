import React from "react";
const {DomainConnection} = require("ws-domain");


export default function Socket() {

    //client
    const client = new DomainConnection("ws://localhost:8080", "testing");


    client.on("error", (err) => {
        console.log("Websocket connection failed to be established, the target might not be online");
    });


    client.on("connect", (ws) => {
        console.log("client: connected to domain");

        ws.on("message", (data) => {
            console.log("client:", data);
            //ws.send("ping");
        });
        ws.send("ping");
    });


    client.on("disconnect", () => {
        console.log("client: disconnected from domain");
    });

    return (<h1>Socket</h1>)
}