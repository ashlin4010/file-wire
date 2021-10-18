import React from "react";
import {Grid} from "@mui/material";
import "./FileGrid.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFile,faFileVideo, faFileImage, faFileAlt, faFilePdf, faFileArchive, faFileCode} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-solid-svg-icons/faFileAudio";

export default function FileGrid(props) {
    const {
        fileStore,
        path,
        onSelect,
        onOpenClick,
        onContextMenu
    } = props;
    let timer;

    const handleClick = ({file, event}) => {
        event.stopPropagation();
        clearTimeout(timer);
        if (event.detail === 1 || event.detail === 0) {
            onSelect({file, directory: path, event});
        } else if (event.detail === 2) {
            onOpenClick({file, directory: path, event});
        }
    }

    const handleContextMenu = ({file, event})  => {
        event.stopPropagation();
        onSelect({file, directory: path, event});
        onContextMenu({file, directory: path, event});
    }

    return (
        <Grid
            container
            className={"file-grid"}
            direction={"row"}
            onClick={(event) => onSelect({file: null, directory: path, event})}
            onContextMenu={(event) => handleContextMenu({file: null, event})}
        >
            {fileStore[path]?.children?.map((filePath) => <FileNode
                key={filePath}
                file={fileStore[filePath]}
                onSelect={handleClick}
                onContextMenu={handleContextMenu}
            />)}
        </Grid>
    );
}

function FileNode(props) {
    const {file, onSelect, onContextMenu} = props
    const {name, selected, isDirectory, type: mineType} = file;

    function getIconAndColor(mineType) {
        let fileIcon;
        let color = "#ffffff";
        if (isDirectory) return [faFolder, color];
        let mimeType = mineType || "application/octet-stream";
        let type = mimeType.split("/")[0];
        let format = mimeType.split("/")[1];

        if (type === "application" || type === "text") {
            switch (format) {
                case "plain":
                    fileIcon = faFileAlt;
                    color = "#78909C"
                    break;
                case "pdf":
                    fileIcon = faFilePdf;
                    color = "#C0392B";
                    break;
                case "javascript":
                case "html":
                    fileIcon = faFileCode
                    color = "#3498DB"
                    break;
                case "zip":
                    fileIcon = faFileArchive
                    color = "#F1C40F"
                    break;
                default:
                    fileIcon = faFile
                    break;
            }
        } else {
            switch (type) {
                case "video":
                    fileIcon = faFileVideo
                    color = "#3498DB"
                    break;
                case "image":
                    fileIcon = faFileImage
                    color = "#16A085"
                    break;
                case "audio":
                    fileIcon = faFileAudio
                    color = "#9B59B6"
                    break;
                default:
                    fileIcon = faFile
                    break;
            }
        }
        return [fileIcon, color];
    }

    function handleClick(event) {
        onSelect({file, event});
    }

    function handleContextMenu(event) {
        event.stopPropagation();
        onSelect({file, event});
        onContextMenu({file, event});
    }

    return (
        <Grid item className={"file-node"} >
            <div onClick={handleClick} onContextMenu={handleContextMenu}>
                <div className={"file-icon"}>
                    <FontAwesomeIcon style={{color: getIconAndColor(mineType)[1]}} className={selected ? "selected-icon" : ""} icon={getIconAndColor(mineType)[0]}/>
                </div>
                <p className={selected ? "selected-text" : ""}>{name}</p>
            </div>
        </Grid>
    );
}