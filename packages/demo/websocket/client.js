const {DomainConnection} = require("ws-domain");

// server
const server = new DomainConnection("ws://localhost:8080", "domain", "cool");

server.on("connect", (wss) => {
    console.log("server: connected to domain", server.domain);
    wss.on("connection", (ws) => {
        console.log("new client connected", ws.id);

        setTimeout(() => {
            ws.close();
            console.log("ok stop that!");
        },3000)

        ws.on("message", (message) => {
            console.log("server:", message);
            ws.send("pong");
        });
    });
});

server.on("disconnect", () => {
    console.log("server: disconnected from domain");
});


// client
const client = new DomainConnection("ws://localhost:8080", "domain");

client.on("connect", (ws) => {
    console.log("client: connected to domain");

    ws.on("message", (data) => {
        console.log("client:", data);
        ws.send("ping");
    });

    ws.send("ping");
});


client.on("disconnect", () => {
    console.log("client: disconnected from domain");
});