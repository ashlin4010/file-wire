import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";
import FileGrid from "./FileGrid";
import { encode, decode } from 'js-base64';

export default function FileBrowser(props) {
    /** @type {RTCController} */
    const RTCController = props.RTCController;
    const history = useHistory();
    let { domainAddress, base64Path } = useParams();
    const [fileCache, setFileCache] = useState({});

    const path = decode(base64Path || "");
    const setPath = (path) => history.push(`/domain/${domainAddress}/${encode(path)}`);

    // when path changes AND when the component first loads
    useEffect(() => {
        // if not connected return to home page
        if (!base64Path) return history.push(`/domain/${domainAddress}/Lw==`);
        if (RTCController === null){
            const autoConnectURL = new URL(window.location.host);
            autoConnectURL.searchParams.append("autoConnect", "true");
            autoConnectURL.searchParams.append("domain", domainAddress);
            autoConnectURL.searchParams.append("path", base64Path);
            return history.push(`/${autoConnectURL.search}`);
        }

        getFiles(path).then(([files, parent]) => {
            setFileCache({...fileCache, ...files, ...parent});
        });
    },[path]);


    return (
        <div>
            <h1>FileBrowser</h1>
            <FileGrid
                path={path}
                files={fileCache}
                setFileCache={setFileCache}
                setPath={setPath}
            />
        </div>
    );


    function getFiles(path){
        return new Promise((resolve, reject) => {
            RTCController.getFiles(path).then(({data}) => {
                let newFiles = {};
                let parent = fileCache[path] || {name: path.split("/").pop(), path: {full: path}};
                data?.forEach(file => {
                    file["selected"] = false;
                    file["children"] = null;
                    newFiles[file.path.full] = file;
                });
                parent.children = Object.keys(newFiles);

                resolve([newFiles, {[path]: parent}])
            });
        });
    }

}