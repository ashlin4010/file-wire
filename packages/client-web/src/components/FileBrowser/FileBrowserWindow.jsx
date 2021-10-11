import React, { useEffect } from 'react';
import {Box, Paper, Menu, MenuItem} from "@mui/material";
import { useHistory } from "react-router-dom";
import { encode } from 'js-base64';
import FileGrid from "./FileGrid";
import FileBrowserAddressBar from "./FileBrowserAddressBar";
import useFileSelection from "../../hooks/useFileSelection";
import useBrowserArguments from "../../hooks/useBrowserArguments";

//import streamSaver from 'streamsaver';


export default function FileBrowser(props) {
    const {
        controller,
        fileStore,
        setFileStore,
        onOpen,
        onPathChange,
        onLocationNext,
        onLocationPrevious,
        onLocationUp
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
        console.log("open", file.name, file.type);
        if(file.isDirectory) changePath(file.path.full, true);
        else {

            onOpen({file, directory, event});
            // controller.createRequestResponseChannel("testing").on("open", (channel => {
            //     console.log("channel open", channel);
            //
            //     // controller.getFileStats(file.path.full)
            //     //     .then(({data}) => {
            //     //         console.log(data);
            //     //     })
            //     //     .catch(({message}) => {
            //     //         console.error(message);
            //     //     });
            //
            //
            //     (async () => {
            //         let chunkSize = 16384;
            //         let fileSize = file.size;
            //
            //         const fileStream = streamSaver.createWriteStream(file.name, {size: file.size});
            //         const writer = fileStream.getWriter();
            //
            //         let bytes = 0;
            //
            //         for(let i = 0; i < (fileSize / chunkSize >> 0); i++) {
            //             let offset = i * chunkSize;
            //             let length = chunkSize;
            //
            //             let {data} = await controller.readFile(file.path.full, {offset, length});
            //             let array = new Uint8Array(data.data);
            //             await writer.write(array);
            //             bytes += array.byteLength;
            //             //console.log(((offset/file.size)*100).toFixed(0));
            //
            //             console.log(bytes, fileSize);
            //         }
            //
            //         console.log("end has come")
            //
            //         let lastChunkOffset = (fileSize / chunkSize >> 0) * chunkSize;
            //         let lastChunkOffsetLength = fileSize % chunkSize;
            //
            //         console.log(lastChunkOffset, lastChunkOffsetLength);
            //
            //         let {data} = await controller.readFile(file.path.full, {offset: lastChunkOffset, length:lastChunkOffsetLength});
            //         let array = new Uint8Array(data.data);
            //
            //         await writer.write(array);
            //         bytes += array.byteLength;
            //
            //         console.log(bytes, fileSize);
            //
            //         await writer.close();
            //     })();
            // }));
        }
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
    },[]); // eslint-disable-line react-hooks/exhaustive-deps

    const [contextMenu, setContextMenu] = React.useState(null);

    const handleClose = (e) => {
        if(e) e.preventDefault();
        setContextMenu(null);
    };

    const handleContextMenu = ({event}) => {
        if(!event.ctrlKey) event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                }
                : null,
        );
    };

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
                <MenuItem onClick={handleClose}>Copy {getSelected().length}</MenuItem>
                <MenuItem onClick={handleClose}>Print</MenuItem>
                <MenuItem onClick={handleClose}>Highlight</MenuItem>
                <MenuItem onClick={handleClose}>Email</MenuItem>
            </Menu>
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
                        onContextMenu={handleContextMenu}
                        onSelect={handleSelection}
                    />
                </Paper>
             </Box>
        </div>);
}