import React, { useState, useEffect, useRef } from 'react';
import {Box, Paper} from "@mui/material";
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
    const {
        controller,
        fileStore,
        setFileStore,
        onSelectionChange,
        onPathChange,
        onLocationNext,
        onLocationPrevious,
        onLocationUp
    } = props;

    const history = useHistory();

    // get, set, decode base64 path
    let { domainAddress, base64Path } = useParams();
    const path = safeDecode(base64Path);
    const prevPath = safeDecode(usePrevious(base64Path));

    const createReConnectLink = () => {
        const autoConnectURL = new URL(window.location.host);
        autoConnectURL.searchParams.append("a", "true");
        autoConnectURL.searchParams.append("d", domainAddress);
        if(base64Path) autoConnectURL.searchParams.append("p", base64Path);
        return (`/${autoConnectURL.search}`);
    }
    const changePath = (path, withHistory) => {
        withHistory = withHistory === undefined ? true : withHistory;
        onPathChange(path, withHistory, (accepted) => {
            if(accepted) history.push(`/domain/${domainAddress}/${encode(path)}`);
        });
    }

    //file selection
    const [selected, setSelected] = useState({});
    const [startSelect, setStartSelect] = useState(null);
    const [endSelect, setEndSelect] = useState(null);
    const select = (isSelected, paths) => {
        paths = Array.isArray(paths) ? paths : [paths];
        let updatedSelected = {};
        paths.forEach((path) => selected[path] = {...fileStore[path], selected: isSelected});
        setSelected({...selected, ...updatedSelected});
    }
    const pushSelected = () => setFileStore({...fileStore, ...selected});


    const handleSelectionChange = ({file, event}) => {
        event.stopPropagation();
        let {shiftKey, ctrlKey} = event;
        let rootFolder = fileStore[path];

        if (!file) {
            select(false, rootFolder.children);
            pushSelected();
            return;
        }

        if (!(shiftKey || ctrlKey)) select(false, rootFolder.children);
        if (shiftKey) {
            let startFile = startSelect || file;
            let start = rootFolder.children.indexOf(startFile.path.full);
            let end = rootFolder.children.indexOf(file.path.full);
            if (endSelect) {
                let oldEnd = rootFolder.children.indexOf(endSelect.path.full);
                if (start !== oldEnd) select(false, rootFolder.children.slice(start, oldEnd + 1));
                if (endSelect) select(false, rootFolder.children.slice(end, oldEnd + 1));
            }
            setEndSelect(file);
            select(true, rootFolder.children.slice(start, end + 1));
        }

        select(!file.selected, file.path.full);
        if (!(shiftKey)) setStartSelect(file);
        pushSelected();

    }

    useEffect(() => {
        if (controller === null) return history.push(createReConnectLink());
        let startPath = path || "/";
        onPathChange(startPath, true, (accepted) => {
            accepted ? history.push(`/domain/${domainAddress}/${encode(startPath)}`) : changePath("/", true);
        });
    },[]);


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
                    path={path}
                    onPathChange={(path) => {changePath(path, true)}}
                    onLocationNext={() => {onLocationNext("next", changePath)}}
                    onLocationPrevious={() => {onLocationPrevious("previous", changePath)}}
                    onLocationUp={() => onLocationUp("up", changePath)}
                />
            </Paper>

            <Paper>
                <FileGrid
                    path={path}
                    fileStore={fileStore}
                    onSelect={handleSelectionChange}
                />
            </Paper>
         </Box>
    );

}