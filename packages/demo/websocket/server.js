const http = require("http");
const {WebSocketDomainServer} = require("ws-domain");

const server = http.createServer();
const ds = new WebSocketDomainServer();

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
        console.log(isLord ? "Server" : "Client", "has connected to", domainAddress);
    });
});

server.listen(8080, () => {
    console.log("server running");
});