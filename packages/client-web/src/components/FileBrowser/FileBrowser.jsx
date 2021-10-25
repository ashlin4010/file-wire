import FileBrowserWindow from "./FileBrowserWindow";
import history from "../../history";
import React from "react";
import { encode } from 'js-base64';
import streamSaver from "streamsaver";
import {MenuItem} from "@mui/material";


export default function FileBrowser(props) {
    const {controller, fileStore, setFileStore, navHistory, domain} = props;
    const [contextMenu, setContextMenu] = React.useState(null);
    const [contextMenuItems, setContextMenuItems] = React.useState([]);

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

    const handleOpen = ({file, directory, event}) => {
        open(file);
    }

    const handleContextMenu = ({file, directory, event, selected}) => {
        if(!event.ctrlKey) event.preventDefault();

        const handleClose = (e) => {
            if(e) e.preventDefault();
            setContextMenu(null);
        };

        const download = () => {
            downLoad(file);
            handleClose();
        }

        const openFile = () => {
            open(file);
            handleClose();
        }

        let items = [];
        if(file && canOpen(file)) items.push(<MenuItem key="1" onClick={openFile}>Open</MenuItem>);
        if(file && !file.isDirectory) items.push(<MenuItem key="2" onClick={download}>Download</MenuItem>);
        items.push(<MenuItem key="3" >Selected: {selected.length}</MenuItem>);
        setContextMenuItems(items);

        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                }
                : null,
        );
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

    const open = (file) => {

        console.log(file.type);

        if(file.isDirectory) {
            handlePathChange(file.path.full,true, (success) => {
                if(success) history.push(`/domain/${domain}/${encode(file.path.full)}`);
            });
        } else {
            switch (file.type) {
                case "image/gif":
                case "image/png":
                case "image/jpeg":
                case "image/svg+xml":
                case "image/tiff":
                case "image/webp":
                case "image/bmp":
                    history.push(`/image/${domain}/${encode(file.path.full)}`);
                    break;
                case "video/mp4":
                    history.push(`/video/${domain}/${encode(file.path.full)}`);
                    break;
                case "text/plain":
                    history.push(`/text/${domain}/${encode(file.path.full)}`);
                    break;
                case "application/pdf":
                    history.push(`/pdf/${domain}/${encode(file.path.full)}`);
                    break;
                case "audio/mpeg":
                    history.push(`/audio/${domain}/${encode(file.path.full)}`);
                    break;
                default: downLoad(file);
            }
        }
    }

    const canOpen = (file) => {
        if (file.type === false) return true;
        switch (file.type) {
            case "image/gif":
            case "image/png":
            case "image/jpeg":
            case "image/svg+xml":
            case "image/tiff":
            case "image/webp":
            case "image/bmp": return true;
            case "video/mp4": return true;
            case "text/plain": return true;
            case "application/pdf": return true;
            case "audio/mpeg": return true;
            default: return false
        }
    }

    const downLoad = (file) => {
        // web-streams-polyfill in index.html
        controller.getFileStream(file.path.full).then(({code, data, message}) => {
            const fileStream = streamSaver.createWriteStream(file.name, {size: file.size,});
            const writer = fileStream.getWriter();
            const channel = controller.streamChannels[data.label].channel;
            let bytesReceived = 0;

            channel.addEventListener("message", ({data}) => {
                writer.write(new Uint8Array(data));
                bytesReceived += data.byteLength;
            });

            channel.addEventListener("close", () => {
                setTimeout(() => {
                    if(bytesReceived >= file.size) writer.close();
                    else writer.abort();
                },1000);
            });
        });
    }

    return (
        <FileBrowserWindow
            controller={controller}
            fileStore={fileStore}
            setFileStore={setFileStore}
            onOpen={handleOpen}
            onPathChange={handlePathChange}
            onLocationNext={handleLocationChange}
            onLocationPrevious={handleLocationChange}
            onLocationUp={handleLocationChange}
            onContextMenu={handleContextMenu}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            contextMenuItems={contextMenuItems}
        />
    );
}