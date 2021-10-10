import React, {useState} from "react";
import {BrowserRouter as Router, Switch, Route, Link, useLocation} from "react-router-dom";
import useNavigationHistory from "../hooks/useNavigationHistory";
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
    const [fileStore, setFileStore] = useState({});
    const [domain, setDomain] = useState("testing");
    const navHistory = useNavigationHistory();

    const handleConnectClick = (domainAddress, openError, completeConnect, history) => {
        //let link = window.location.href.replace("http", "ws");
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
                setTimeout(openError, 600);
            });
    }

    const handlePathChange = (path, withHistory, acceptPathChange) => {
        getFiles(path).then(([files, parent]) => {
            setFileStore({...fileStore, ...files, ...parent});
            if(withHistory) navHistory.add(path);
            acceptPathChange(true);
        }).catch((e) => {
            console.error(e);
            acceptPathChange(false);
        });
    }

    const handleLocationChange = (direction, changePath) => {
        if(direction === "next" && navHistory.next()) {
            handlePathChange(navHistory.next(), false,(accepted) => {
                changePath(navHistory.next(),false);
                if(accepted) navHistory.goForward();
            });
        }
        else if(direction === "previous" && navHistory.previous()){
            handlePathChange(navHistory.previous(), false,(accepted) => {
                changePath(navHistory.previous(), false);
                if(accepted) navHistory.goBack();
            });
        }
        else if(direction === "up"){
            let path = navHistory.get();
            if(!path || path === "/") return;
            let next = path.substring(0, path.lastIndexOf('/')) || "/";
            changePath(next, true);
        }
    }

    const getFiles = (path) => {
        return new Promise((resolve, reject) => {
            controller.getFiles(path)
                .then(({data}) => {
                    let parent = fileStore[path] || {name: (path === "/") ? "/" : path.split("/").pop(), path: {full: path}};
                    let newFiles = {};
                    data.forEach(file => {
                        file["selected"] = false;
                        file["children"] = null;
                        newFiles[file.path.full] = file;
                    });
                    parent["children"] = Object.keys(newFiles);
                    parent["TTL"] = 5;
                    resolve([newFiles, {[path]: parent}])
                })
                .catch(({message}) => {
                    reject(message);
                });
        });
    }

    return (
        <Router>
            <NavBar/>
            {/*<Link className={"icon-root"} to="/domain/testing/zzz">Bad Path</Link>*/}
            <Switch>
                <Route path="/domain/:domainAddress/:base64Path?">
                    <FileBrowser
                        controller={controller}
                        fileStore={fileStore}
                        setFileStore={setFileStore}
                        onSelectionChange
                        onPathChange={handlePathChange}
                        onLocationNext={handleLocationChange}
                        onLocationPrevious={handleLocationChange}
                        onLocationUp={handleLocationChange}
                    />
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
