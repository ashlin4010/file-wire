import React, {useState} from "react";
import {Grid} from "@mui/material";
import "./FileGrid.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFile,faFileVideo, faFileImage, faFileAlt, faFilePdf, faFileArchive, faFileCode} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-solid-svg-icons/faFileAudio";

export default function FileGrid(props) {
    const { fileStore, path, onSelect} = props;

    const handleSelect = ({file, event}) => {
        onSelect({file, event});
    }

    return (
        <Grid
            container
            className={"file-grid"}
            direction={"row"}
            onClick={(event) => handleSelect({file: null, event})}
        >
            {fileStore[path]?.children?.map((filePath) => <FileNode
                key={filePath}
                file={fileStore[filePath]}
                onSelect={handleSelect}
            />)}
        </Grid>
    );
}

function FileNode(props) {
    const {file, onSelect} = props
    const {name, selected, isDirectory, type: mineType} = file;

    function getIcon(mineType) {
        if (isDirectory) return faFolder;
        let mimeType = mineType || "application/octet-stream";
        let type = mimeType.split("/")[0];
        let format = mimeType.split("/")[1];
        let fileIcon;
        if (type === "application" || type === "text") {
            switch (format) {
                case "plain":
                    fileIcon = faFileAlt;
                    break;
                case "pdf":
                    fileIcon = faFilePdf;
                    break;
                case "javascript":
                case "html":
                    fileIcon = faFileCode
                    break;
                case "zip":
                    fileIcon = faFileArchive
                    break;
                default:
                    fileIcon = faFile
                    break;
            }
        } else {
            switch (type) {
                case "video":
                    fileIcon = faFileVideo
                    break;
                case "image":
                    fileIcon = faFileImage
                    break;
                case "audio":
                    fileIcon = faFileAudio
                    break;
                default:
                    fileIcon = faFile
                    break;
            }
        }
        return fileIcon;
    }

    function handleClick(event) {
        if(event.type === "dblclick") {
        } else onSelect({file, event});
    }

    return (
        <Grid item className={"file-node"} >
            <div>
                <div onClick={handleClick} className={"file-icon"}>
                    <FontAwesomeIcon className={selected ? "selected-icon" : ""} icon={getIcon(mineType)}/>
                </div>
                <a className={selected ? "selected-text" : ""}>{name}</a>
            </div>

        </Grid>
    );
}