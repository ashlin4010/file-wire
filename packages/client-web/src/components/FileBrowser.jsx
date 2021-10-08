import React, { useState, useEffect, useRef } from 'react';
import {Box, Paper, ButtonGroup, Button, TextField, FormGroup, Grid} from "@mui/material";
import { useHistory, useParams } from "react-router-dom";
import { encode, decode } from 'js-base64';
import FileGrid from "./FileGrid";
import FileBrowserAddressBar from "./FileBrowserAddressBar";


function safeDecode(string) {
    string = string || "";
    if(string === "") return "";
    try {
        return decode(string);
    } catch (e) {
        return "";
    }
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default function FileBrowser(props) {
    /** @type {RTCController} */
    const RTCController = props.RTCController;
    const history = useHistory();

    // create and update files state
    const [fileCache, setFileCache] = useState({});

    // get, set, decode base64 path
    let { domainAddress, base64Path } = useParams();
    const currentPath = safeDecode(base64Path) || null;
    const prevPath = safeDecode(usePrevious(base64Path)) || "/";
    const changePath = (path) => {
        history.push(`/domain/${domainAddress}/${encode(path)}`);
    }

    // Navigation History
    const [navigationHistory, setNavigationHistory] = useState([currentPath]);
    const [navigationIndex, setNavigationIndex] = useState(0);
    const addHistory = (path) => {
        let nHis = navigationHistory.slice(0, navigationIndex + 1);
        nHis.push(path);
        setNavigationHistory(nHis);
        setNavigationIndex(navigationIndex + 1);
    }
    const getHistory = () => navigationHistory[navigationIndex];
    const getPreviousHistory = () => {
        if(navigationIndex < 1) return false;
        return navigationHistory[navigationIndex - 1];
    }
    const getNextHistory = () => {
        if(navigationIndex + 1 >= navigationHistory.length) return false;
        return navigationHistory[navigationIndex + 1];
    }
    const moveBackHistory  = () => {
        if(navigationIndex < 1) return false;
        setNavigationIndex(navigationIndex - 1);
    }
    const moveForwardHistory  = () => {
        if(navigationIndex + 1 >= navigationHistory.length) return false;
        setNavigationIndex(navigationIndex + 1);
    }
    const changePathWithHistory = (path) => {
        changePath(path);
        addHistory(path);
    }
    const navHistory = {addHistory, getHistory, getPreviousHistory, getNextHistory, moveBackHistory, moveForwardHistory};


    const createReConnectLink = () => {
        const autoConnectURL = new URL(window.location.host);
        autoConnectURL.searchParams.append("a", "true");
        autoConnectURL.searchParams.append("d", domainAddress);
        autoConnectURL.searchParams.append("p", base64Path);
        return (`/${autoConnectURL.search}`);
    }

    // run on first component mount and each time the currentPath (base64Path) changes
    useEffect(() => {
        // if not connected return to home page or path
        if (!base64Path || currentPath === null) return changePath("/");
        if (RTCController === null) return history.push(createReConnectLink());

        getFiles(currentPath).then(([files, parent]) => {
            setFileCache({...fileCache, ...files, ...parent});
        }).catch((e) => {
            // if getFiles(path) has error than go to prevPath
            console.error(e);
            changePath(prevPath);
        });
    },[currentPath]);

    return (
        <Box
            sx={{
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: "80%",
                '& > :not(style)': {
                    m: 1,
                    color: "#ffffff",
                    backgroundColor: "#34425A",
                    padding: "20px"
                },
            }}>

            <Paper style={{padding: 0}}>
                <FileBrowserAddressBar
                    path={currentPath}
                    changePathWithHistory={changePathWithHistory}
                    changePath={changePath}
                    navHistory={navHistory}
                />
            </Paper>

            <Paper>
                <FileGrid
                    path={currentPath}
                    files={fileCache}
                    setFileCache={setFileCache}
                    setPath={changePathWithHistory}
                />
            </Paper>
         </Box>
    );


    function getFiles(path) {
        return new Promise((resolve, reject) => {
            RTCController.getFiles(path)
                .then(({code, data, message}) => {

                    console.log(data);

                    let newFiles = {};
                    let parent = fileCache[path] || {name: path.split("/").pop(), path: {full: path}};
                    data.forEach(file => {
                        file["selected"] = false;
                        file["children"] = null;
                        newFiles[file.path.full] = file;
                    });
                    parent.children = Object.keys(newFiles);
                    resolve([newFiles, {[path]: parent}])
                })
                .catch(({code, message}) => {
                    reject(message);
                });
        });
    }

}