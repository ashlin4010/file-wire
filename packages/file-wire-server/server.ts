import { WebSocketDomainServer } from "ws-domain";
import * as express from "express";
import * as http from "http";
import * as path from "path";
import { URL } from "url";
const app = express();
const server = http.createServer(app);
const domainServer = new WebSocketDomainServer();

const serverAdr = process.env.SERVER_ADR || "127.0.0.1";
const isProduction = process.env.NODE_ENV === "production";

app.use(express.static("public"));

// app.get("/*", (req,res) => {
//     res.redirect("/");
// });

app.get(['/', '/*'], function(req, res, next) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.on('upgrade', function upgrade(request, socket, head) {
    const reqUrl = new URL(request.url || serverAdr, 'http://' + request.headers.host);
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
    let address = isProduction ? `https://${serverAdr}` : `http://${serverAdr}:8080`
    log(address);
});

function log(...data: any) {
    console.log("[Server]:", ...data);
}