import { WebSocketDomainServer } from "ws-domain";
import * as express from "express";
import * as http from "http";
import { URL } from "url";

const app = express();
const server = http.createServer(app);
const domainServer = new WebSocketDomainServer();

app.use(express.static("public"));

server.on('upgrade', function upgrade(request, socket, head) {
    const reqUrl = new URL(request.url || "localhost", 'http://' + request.headers.host);
    let token = reqUrl.searchParams.get("token");
    let isLord = !!token;

    let domainAddress = reqUrl.pathname.replace(/\//g, '');
    let domain = domainServer.getDomain(domainAddress);

    log("Connection Request:", reqUrl.href, "token:", token);

    if (!isLord && !domain?.lord) return socket.destroy();

    domainServer.handleUpgrade(request, socket, head, (client) => {
        if(!domain) domain = domainServer.createDomain(domainAddress);
        isLord ? domain.setLord(client) : domain.addMember(client);
        log(isLord ? "Server" : "Client", "has connected to", domainAddress);
    });
});

server.listen(8080, () => {
    log("http://localhost:8080");
});

function log(...data: any) {
    console.log("[Server]:", ...data);
}