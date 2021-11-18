import { DomainConnection } from "ws-domain";
import { WsDuplex, RTCConnection } from "rtc-connection";
import { RTCController } from "rtc-controller";
import { FileSystemInterface } from "common-file-system";

import React, {useState} from "react";
import {Router, Switch, Route} from "react-router-dom";
import history from "../history";
import useNavigationHistory from "../hooks/useNavigationHistory";

import NavBar from "./Header/NavBar";
import DomainConnectMenu from "./DomainConnectMenu/DomainConnectMenu";
import CreateDomain from "./DomainCreation/CreateDomain";
import FileBrowser from "./FileBrowser/FileBrowser";
import ImageViewer from "./ImageViewer/ImageViewer";
import VideoPlayer from "./VideoPlayer/VideoPlayer";
import TextViewer from "./TextViewer/TextViewer";
import PDFViewer from "./PDFViewer";
import AudioPlayer from "./AudioPlayer/AudioPlayer";
import "./App.css";

const isProduction = process.env.NODE_ENV === "production";

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
        let rtc = new RTCConnection(wsDuplex, isInitiator , {
            'iceServers': [
                {
                    'urls': 'stun:stun.filewire.io:3478'
                },
                {
                    'urls': 'stun:stun.l.google.com:19302'
                }
            ]
        });

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
    const defaultDomain = isProduction ? "" : "TESTING";
    const [controller, setController] = useState(null);
    const [fileStore, setFileStore] = useState({});
    const [domain, setDomain] = useState(defaultDomain);
    const navHistory = useNavigationHistory();
    let link = isProduction ? window.location.origin.replace("http", "ws") : "ws://localhost:8080";

    const handleConnectClick = (domain, openError, completeConnect) => {
        tryConnect(link, domain, true, false)
            .then(controller => {
                controller.on("disconnect", () => {
                    setController(null);
                });
                setController(controller);
                completeConnect();
            })
            .catch(() => {
                setTimeout(openError, 600);
            });
    }

    const handleCreateDomain = () => {
        history.push(`/create`);
    }

    return (
        <Router history={history}>
            <NavBar/>
            <Switch>
                <Route path="/domain/:domainAddress/:base64Path?">
                    <FileBrowser
                        controller={controller}
                        domain={domain}
                        fileStore={fileStore}
                        setFileStore={setFileStore}
                        navHistory={navHistory}
                    />
                </Route>

                <Route path="/create">
                    <CreateDomain url={link}/>
                </Route>

                <Route path="/image/:domainAddress/:base64Path?">
                    <ImageViewer
                        controller={controller}
                        fileStore={fileStore}
                    />
                </Route>

                <Route path="/video/:domainAddress/:base64Path?">
                    <VideoPlayer
                        controller={controller}
                        fileStore={fileStore}
                    />
                </Route>

                <Route path="/text/:domainAddress/:base64Path?">
                    <TextViewer
                        controller={controller}
                        fileStore={fileStore}
                    />
                </Route>

                <Route path="/pdf/:domainAddress/:base64Path?">
                    <PDFViewer
                        controller={controller}
                        fileStore={fileStore}
                    />
                </Route>

                <Route path="/audio/:domainAddress/:base64Path?">
                    <AudioPlayer
                        controller={controller}
                        fileStore={fileStore}
                    />
                </Route>


                <Route path="/*">
                    <DomainConnectMenu
                        RTCController={controller}
                        domain={domain}
                        setDomain={setDomain}
                        onConnect={handleConnectClick}
                        onCreateDomain={handleCreateDomain}
                    />
                </Route>
            </Switch>
        </Router>
    );
}
