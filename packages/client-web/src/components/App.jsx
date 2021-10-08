import React, {useState} from "react";
import {BrowserRouter as Router, Switch, Route, Link, useLocation} from "react-router-dom";
import "./App.css";
import NavBar from "./NavBar";
import DomainConnectMenu from "./DomainConnectMenu";
import FileBrowser from "./FileBrowser";


import { DomainConnection } from "ws-domain";
import { WsDuplex, RTCConnection } from "rtc-connection";
import { RTCController } from "rtc-controller";
import { FileSystemInterface } from "common-file-system";

function createDomainConnection(url, domain) {
    return new Promise((resolve, reject) => {
        const dc = new DomainConnection(url, domain);
        dc.on("error", reject);
        dc.on("connect", ws => resolve([ws, dc]));
    });
}

/**
 * Attempts to establish an RTC connection from ws connection
 *
 * @returns {Promise<RTCController>} A promise that contains the RTCController
 */
function createWebRTCConnection(ws, isInitiator, isServer) {
    return new Promise((resolve, reject) => {
        let wsDuplex = new WsDuplex(ws);
        let fs = new FileSystemInterface();
        let rtc = new RTCConnection(wsDuplex, isInitiator , {});
        let controller = new RTCController(rtc, isServer, isInitiator, fs);

        controller.on("control", () => {
            resolve(controller);
        });
    })
}

/**
 * Attempts to establish an RTC and ws connection
 *
 * @returns {Promise<RTCController>} A promise that contains the RTCController
 */
function tryConnect(url, domainAddress, isInitiator, isServer) {
    return new Promise(async (resolve, reject) => {
        createDomainConnection(url, domainAddress).then(([ws, dc]) => {
            createWebRTCConnection(ws, isInitiator, isServer).then(controller => {
                ws.close();
                resolve(controller);
            })
        }).catch(reject);
    });
}

export default function App() {

    /** @type {RTCController} */
    const initialState = null;
    const [controller, setController] = useState(initialState);
    const [domain, setDomain] = useState("testing");

    const handleConnectClick = (domainAddress, openError, completeConnect, history) => {
        tryConnect("ws://localhost:8080", domainAddress, true, false)
            .then(controller => {
                controller.on("disconnect", () => {
                    setController(null);
                });
                setController(controller);
                setDomain(domainAddress);
                completeConnect();
            })
            .catch(() => {
                setTimeout(openError, 600)
            });
    }

    return (
        <Router>
            <NavBar/>
            <Link className={"icon-root"} to="/domain/testing/zzz">Bad Path</Link>
            <Switch>
                <Route path="/domain/:domainAddress/:base64Path?">
                    <FileBrowser RTCController={controller} domain={domain}/>
                </Route>

                <Route path="/*" render={({history}) =>
                    <DomainConnectMenu
                        RTCController={controller}
                        defaultValue={domain}
                        domain={domain}
                        setDomain={setDomain}
                        onConnect={(domainAddress, openError, completeConnect)=> handleConnectClick(domainAddress, openError,completeConnect, history)}
                    />
                }/>
            </Switch>
        </Router>
    );
}
