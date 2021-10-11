import FileBrowserWindow from "./FileBrowserWindow";
import history from "../../history";
import React from "react";
import { encode } from 'js-base64';


export default function FileBrowser(props) {
    const {controller, fileStore, setFileStore, navHistory, domain} = props;

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
        history.push(`/image/${domain}/${encode(file.path.full)}`);
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
        <FileBrowserWindow
            controller={controller}
            fileStore={fileStore}
            setFileStore={setFileStore}
            onOpen={handleOpen}
            onPathChange={handlePathChange}
            onLocationNext={handleLocationChange}
            onLocationPrevious={handleLocationChange}
            onLocationUp={handleLocationChange}
        />
    );


}