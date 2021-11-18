import { DomainConnection } from "ws-domain";
import { FileSystemInterface } from "common-file-system";
import { RTCConnection, WsDuplex } from "rtc-connection";
import { RTCController } from "rtc-controller";
import React, {useEffect, useState} from "react";
import {fileOpen, supported} from "browser-fs-access";
import useNavigationHistory from "./../../hooks/useNavigationHistory";
import * as mime from "mime-types";
import useFileSelection from "./../../hooks/useFileSelection";
import CreateDomainWindow from "./CreateDomainWindow";

function convertToTree(flatFiles) {
    let rootDir = flatFiles["/"];
    function getChildren(node) {
        if(!node || !node.children) return {};
        let children = node.children;
        let nodes = {};
        children.forEach((key) => {
            let node = flatFiles[key];
            if(node.isDirectory) nodes[node.name] = getChildren(node);
            else {
                nodes[node.name] = node.file
            }
        });
        return nodes;
    }
    return getChildren(rootDir);
}

if (supported) {
    console.log('Using native File System Access API.');
} else {
    console.log('Using the fallback implementation.');
}

let isServer = true;
let isInitiator = !isServer;

function tryConnect(url,domain, maxRetries = 5) {
    console.log("Connection to server...")
    return new Promise((resolve, reject) => {
        let attempt = 0;
        let retry = setInterval(() => {
            let domainConnection = new DomainConnection(url, domain, isServer ? "token" : undefined);

            domainConnection.on("error", (err) => {
                attempt += 1;
                console.log("Websocket connection failed to be established, the target might not be online, retrying in 1 second");
                if(attempt > maxRetries) {
                    clearInterval(retry);
                    reject("Websocket connection failed to be established");
                }
            });

            domainConnection.on("connect", async (wsProxy) => {
                clearInterval(retry);
                resolve({domainConnection, wsProxy});

                domainConnection.on("disconnect", ((code, reason) => {
                    console.log("Connection to signalling server closed code:", code, "reason:", reason);
                    if(code === 1000) return;
                    domainConnection.removeAllListeners();
                    tryConnect(url,domain).then(handleConnection).catch(connectFailed);
                }));
            });
        }, 1000);
    });
}

function handleConnection({domainConnection, wsProxy}, fss) {
    console.log("Connected to signalling server");
    if(isServer) {
        wsProxy.on("connection", (ws) => {
            console.log("Client has joint domain");
            let wsDuplex = new WsDuplex(ws);
            let fs = new FileSystemInterface(fss);

            let rtc = new RTCConnection(wsDuplex, isInitiator, {
                'iceServers': [
                    {
                        'urls': `stun:stun.filewire.io:3478`
                    },
                    {
                        'urls': 'stun:stun.l.google.com:19302'
                    }
                ]
            });
            let controller = new RTCController(rtc, isServer, isInitiator, fs);

            console.log("Establishing RTC connection...");
            rtc.on("connect", () => console.log("RTC connection open"));

            controller.on("control", (channel) => {
                console.log("Control channel open and ready");
                ws.close();
                // channel.on("message", (message, send) => {
                //     log(message);
                // });
            });
        });
    }
}

function connectFailed() {
    console.log("Failed to connect to signalling server, stopping");
}

export default function CreateDomain(props) {
    const {url} = props;
    const [connection, setConnection] = useState(null);
    const [fileStore, setFileStore] = useState({});
    const navHistory = useNavigationHistory();
    const {handleSelection, pushSelected, getSelected, deselectAll} = useFileSelection(fileStore, setFileStore);
    const [domain, setDomain] = useState((Math.random() + 1).toString(36).substring(7).toUpperCase());
    const [path, setPath] = useState("/");

    useEffect(() => {
        navHistory.add(path);
    },[])

    useEffect(() => {
        deselectAll();
        pushSelected();
    },[path]); // eslint-disable-line react-hooks/exhaustive-deps

    const connect = (event, success, error) => {
        let tree = convertToTree(fileStore);
        tryConnect(url, domain).then(({domainConnection, wsProxy}) => {
            setConnection(domainConnection);
            handleConnection({domainConnection, wsProxy}, tree);
            success();
        }).catch(connectFailed);
    }

    const disconnect = (event, success, error) => {
        connection.close(1000, "User Close");
        success();
    }

    const handlePathChange = (path, withHistory) => {
        setPath(path);
        if(withHistory) navHistory.add(path);
    }

    const handleLocationChange = (direction) => {
        if(direction === "next" && navHistory.next()) {
            handlePathChange(navHistory.next(), false);
            navHistory.goForward();
        }
        else if(direction === "previous" && navHistory.previous()){
            handlePathChange(navHistory.previous(), false);
            navHistory.goBack();
        }
        else if(direction === "up"){
            let path = navHistory.get();
            if(!path || path === "/") return;
            let next = path.substring(0, path.lastIndexOf('/')) || "/";
            handlePathChange(next, true);
        }
    }

    const handleOpen = ({file, directory, event}) => {
        if(file.isDirectory) {
            handlePathChange(file.path.full, true);
        }
    };

    const createFileObject = (parentPath, file) => {
        return {
            "name": file.name,
            "type": mime.lookup(file.name),
            "size": file.size,
            "lastModified": file.lastModified,
            "lastModifiedDate": file.lastModifiedDate,
            "isDirectory": false,
            "selected": false,
            "path": {
                "root": "/",
                "dir": parentPath,
                "base": file.name,
                "ext": "",
                "name": file.name,
                "full": `${parentPath}${file.name}`
            },
            "children": null,
            "file": file
        }
    }

    const addFile = () => {
        let parentPath = path;
        let parentFolder = {...fileStore[parentPath]};
        let currentFiles = new Set(parentFolder.children)

        fileOpen({
            startIn: 'downloads',
            multiple: true,
        }).then(files => {
            let newFiles = files.map(file => createFileObject(parentPath, file));
            let newFilesObject = {};
            newFiles.forEach((file) => {
                if(!currentFiles.has(file.path.full)) newFilesObject[file.path.full] = file
            });
            parentFolder.children = parentFolder.children ? [...parentFolder.children, ...Object.keys(newFilesObject)] : [...Object.keys(newFilesObject)];
            let newFileStore = {...fileStore, ...newFilesObject, [parentPath]: parentFolder};
            setFileStore(newFileStore);
        }).catch(() => {});
    }

    const removeSelected = () => {
        let selected = getSelected();
        let parentPath = path;
        let parentFolder = {...fileStore[parentPath]};
        let children = new Set(parentFolder.children);
        let newFileStore = {...fileStore};

        selected.forEach((file) => {
            children.delete(file.path.full);
            delete newFileStore[file.path.full];
        });

        parentFolder.children = [...children]
        setFileStore({...newFileStore, [parentPath]: parentFolder})
    }

    const createFolderObject = (parentPath, name) => {
        return {
            "name": name,
            "type": false,
            "isDirectory": true,
            "selected": false,
            "path": {
                "root": "/",
                "dir": parentPath,
                "base": name,
                "ext": "",
                "name": name,
                "full": parentPath === "/" ? `${parentPath}${name}` : `${parentPath}/${name}`
            },
            "children": null,
        }
    }

    const addFolder = (name) => {
        let parentPath = path;
        let parentFolder = {...fileStore[parentPath]};
        let newFolder = createFolderObject(parentPath, name);

        if(fileStore[newFolder.path.full]) return false;

        parentFolder.children = parentFolder.children ? [...parentFolder.children, newFolder.path.full] : [newFolder.path.full];
        let newFileStore = {...fileStore, [newFolder.path.full]: newFolder, [parentPath]: parentFolder};
        setFileStore(newFileStore);
        return true;
    }

    return (
        <CreateDomainWindow
            domain={domain}
            setDomain={setDomain}
            path={path}
            fileStore={fileStore}
            setFileStore={setFileStore}
            addFolder={addFolder}
            addFile={addFile}
            removeSelected={removeSelected}
            onOpen={handleOpen}
            onNav={handleLocationChange}
            onPathChange={(path) => {handlePathChange(path, true)}}
            onSelect={handleSelection}
            onConnect={connect}
            onDisconnect={disconnect}
        />
    );
}