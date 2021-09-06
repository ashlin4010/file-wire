const {WebSocketDomainServer} = require("ws-domain");
let http = require("http");
let express = require("express");
let app = express();

const server = http.createServer(app);
const ds = new WebSocketDomainServer();


function log(...data) {
    console.log("[Server]:", ...data);
}

app.use(express.static("public"));

server.on('upgrade', function upgrade(request, socket, head) {
    const reqUrl = new URL(request.url, 'http://' + request.headers.host);
    let token = reqUrl.searchParams.get("token");
    let isLord = !!token;

    let domainAddress = reqUrl.pathname.replace(/\//g, '');
    let domain = ds.getDomain(domainAddress);
    if (!isLord && !domain?.lord) return socket.destroy();


    ds.handleUpgrade(request, socket, head, (client) => {
        if(!domain) domain = ds.createDomain(domainAddress);
        isLord ? domain.setLord(client) : domain.addMember(client);
        log(isLord ? "Server" : "Client", "has connected to", domainAddress);
    });
});

server.listen(8080, () => {
    log("http://localhost:8080");
    log("http://localhost:8080#server");
});