import React, {useState} from "react";
import {Grid, Icon, IconButton, SvgIcon, Paper, Box} from "@mui/material";
import "./FileGrid.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFile,faFileVideo, faFileImage, faFileAlt, faFilePdf, faFileArchive, faFileCode} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-solid-svg-icons/faFileAudio";

export default function FileGrid(props) {
    const {path, files, setFileCache, setPath} = props;

    let fileNodes = files[path]?.children?.map((filePath) => {
        return (
            <FileNode
                key={filePath}
                file={files[filePath]}
                files={files}
                setFiles={setFileCache}
                setPath={setPath}
            />
        );
    });
    return (
        <Grid className={"file-grid"} container direction={"row"}>{fileNodes}</Grid>
    );
}


function FileNode(props) {
    let {file, files, setFiles, setPath} = props;
    let {name, selected} = file;
    let fullPath = file.path.full;
    const isDirectory = file.isDirectory;

    function getIcon() {
        if (isDirectory) return faFolder;
        let mimeType = file.type || "application/octet-stream";
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

    function setSelected(isSelected) {
        let updated = {...files[fullPath], selected: isSelected};
        setFiles({...files, [fullPath]: updated});
    }
    
    function setSelectedAllInDirectory(path, selected = true) {
        let directory = files[path];

        console.log(directory.children);

        let updated = {};

        directory.children?.forEach((childPath) => {
            let child = files[childPath];
            if(child) updated[childPath] = {...child, selected: selected};
        });

        console.log(updated);
        setFiles({...files, ...updated});
    }

    function handleClick(e) {
        if(e.type === "dblclick") {
            if(isDirectory) changeCurrentFolder();
        }
        //setSelectedAllInDirectory(file.path.dir,true)
        setSelected(!selected);

    }

    function changeCurrentFolder() {
        setPath(fullPath);
    }

    return (
        <Grid item className={"file-node"} onDoubleClick={handleClick} onClick={handleClick}>
            <div className={"file-icon"}>
                <FontAwesomeIcon className={selected ? "selected-icon" : ""} icon={getIcon()}/>
            </div>
            <a className={selected ? "selected-text" : ""}>{name}</a>
        </Grid>
    );
}