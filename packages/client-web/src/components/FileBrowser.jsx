import React, { useState, useEffect } from 'react';
import {Box, Paper} from "@mui/material";
import { useHistory } from "react-router-dom";
import { encode } from 'js-base64';
import FileGrid from "./FileGrid";
import FileBrowserAddressBar from "./FileBrowserAddressBar";
import useFileSelection from "../hooks/useFileSelection";
import useBrowserArguments from "../hooks/useBrowserArguments";


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
    const {domainAddress, path, createReConnectLink} = useBrowserArguments();

    //file selection
    const {handleSelection} = useFileSelection(fileStore, setFileStore);
    // const [startSelect, setStartSelect] = useState(null);
    // const [endSelect, setEndSelect] = useState(null);
    // const handleSelectionChange = ({file, event}) => {
    //     event.stopPropagation();
    //     let {shiftKey, ctrlKey} = event;
    //     let rootFolder = fileStore[path];
    //
    //     if (!file) {
    //         select(false, rootFolder.children);
    //         pushSelected();
    //         return;
    //     }
    //
    //     if (!(shiftKey || ctrlKey)) select(false, rootFolder.children);
    //     if (shiftKey) {
    //         let startFile = startSelect || file;
    //         let start = rootFolder.children.indexOf(startFile.path.full);
    //         let end = rootFolder.children.indexOf(file.path.full);
    //         if (endSelect) {
    //             let oldEnd = rootFolder.children.indexOf(endSelect.path.full);
    //             if (start !== oldEnd) select(false, rootFolder.children.slice(start, oldEnd + 1));
    //             if (endSelect) select(false, rootFolder.children.slice(end, oldEnd + 1));
    //         }
    //         setEndSelect(file);
    //         select(true, rootFolder.children.slice(start, end + 1));
    //     }
    //
    //     select(!file.selected, file.path.full);
    //     if (!(shiftKey)) setStartSelect(file);
    //     pushSelected();
    // }

    const changePath = (path, withHistory) => {
        withHistory = withHistory === undefined ? true : withHistory;
        onPathChange(path, withHistory, (accepted) => {
            if(accepted) history.push(`/domain/${domainAddress}/${encode(path)}`);
        });
    }

    const handleOpen = ({file, directory, event}) => {
        console.log("open", file.name, file.type);
        if(file.isDirectory) changePath(file.path.full, true)
    }


    useEffect(() => {
        if (controller === null) return history.push(createReConnectLink());
        onPathChange(path, true, (accepted) => {
            if(accepted) {
                history.push(`/domain/${domainAddress}/${encode(path)}`);
            } else {
                changePath("/", true);
            }
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
                    onOpenClick={handleOpen}
                    onSelect={handleSelection}
                />
            </Paper>
         </Box>
    );
}