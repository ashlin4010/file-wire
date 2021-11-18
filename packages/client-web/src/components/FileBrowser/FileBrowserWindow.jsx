import React, { useEffect } from 'react';
import {Box, Paper, Menu} from "@mui/material";
import { useHistory } from "react-router-dom";
import { encode } from 'js-base64';
import FileGrid from "./FileGrid";
import FileBrowserAddressBar from "./FileBrowserAddressBar";
import useFileSelection from "../../hooks/useFileSelection";
import useBrowserArguments from "../../hooks/useBrowserArguments";


export default function FileBrowser(props) {
    const {
        controller,
        fileStore,
        setFileStore,
        navHistory,
        onOpen,
        onPathChange,
        onLocationNext,
        onLocationPrevious,
        onLocationUp,
        onContextMenu,
        contextMenu,
        setContextMenu,
        contextMenuItems,
    } = props;

    const history = useHistory();
    const {domainAddress, path, createReConnectLink} = useBrowserArguments();

    //file selection
    const {handleSelection, getSelected, setSelected} = useFileSelection(fileStore, setFileStore);

    const changePath = (path, withHistory) => {
        withHistory = withHistory === undefined ? true : withHistory;
        onPathChange(path, withHistory, (accepted) => {
            // each time we reload the browser clear selected
            setSelected({});
            if(accepted) history.push(`/domain/${domainAddress}/${encode(path)}`);
        });
    }

    const handleOpen = ({file, directory, event}) => {
        onOpen({file, directory, event});
    }

    const handleClose = (e) => {
        if(e) e.preventDefault();
        setContextMenu(null);
    };

    const handleContextMenu = ({file, directory, event}) => {
        onContextMenu({selected: getSelected(), file, directory, event});
    };

    useEffect(() => {
        if (controller === null) return history.push(createReConnectLink());
        // only add to history if the has is been loaded for the first time
        // previous history means that the page is not new
        let useHistory = navHistory.previous() === false;

        onPathChange(path, useHistory, (accepted) => {
            if(accepted) {
                history.push(`/domain/${domainAddress}/${encode(path)}`);
            } else {
                changePath("/", true);
            }
        });
    },[]); // eslint-disable-line react-hooks/exhaustive-deps

    return (<div onContextMenu={handleClose}>
            <Menu
                disableAutoFocusItem
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX}
                        : undefined
                }
            >
                { contextMenuItems }
            </Menu>

            <Box
                sx={{
                    marginTop: 4,
                    marginLeft: "auto",
                    marginRight: "auto",
                    maxWidth: "60%",
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
                        onContextMenu={handleContextMenu}
                        onSelect={handleSelection}
                    />
                </Paper>
             </Box>
        </div>);
}