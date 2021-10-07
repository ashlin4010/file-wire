import React, {useState} from "react";
import {Grid, Icon, IconButton, SvgIcon} from "@mui/material";
import "./FileGrid.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFile,faFileVideo, faFileImage, faFileAlt, faFilePdf, faFileArchive, faFileCode} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-solid-svg-icons/faFileAudio";
import mime from "mime-types";


function FileNode(props) {
    let {id, file, files, setFlatFiles,setCurrentFolder} = props;
    let {name, extension, type, selected} = file;
    const isFolder = "folder" === (type || "file"); // file | folder

    function getIcon() {
        // if (isFolder) return <FontAwesomeIcon icon={faFolder}/>;
        if (isFolder) return faFolder;
        let mimeType = mime.lookup(extension) || "application/octet-stream";
        let type = mimeType.split("/")[0];
        let format = mimeType.split("/")[1];
        let fileIcon;
        if (type === "application" || type === "text") {
            switch (format) {
                case "plain":
                    // fileIcon = <FontAwesomeIcon icon={faFileAlt}/>;
                    fileIcon = faFileAlt;
                    break;
                case "pdf":
                    // fileIcon = <FontAwesomeIcon icon={faFilePdf}/>;
                    fileIcon = faFilePdf;
                    break;
                case "javascript":
                case "html":
                    // fileIcon = <FontAwesomeIcon icon={faFileCode}/>
                    fileIcon = faFileCode
                    break;
                case "zip":
                    // fileIcon = <FontAwesomeIcon icon={faFileArchive}/>
                    fileIcon = faFileArchive
                    break;
                default:
                    // fileIcon = <FontAwesomeIcon icon={faFile}/>;
                    fileIcon = faFile
                    break;
            }
        } else {
            switch (type) {
                case "video":
                    // fileIcon = <FontAwesomeIcon icon={faFileVideo}/>
                    fileIcon = faFileVideo
                    break;
                case "image":
                    // fileIcon = <FontAwesomeIcon icon={faFileImage}/>
                    fileIcon = faFileImage
                    break;
                case "audio":
                    // fileIcon = <FontAwesomeIcon icon={faFileAudio}/>
                    fileIcon = faFileAudio
                    break;
                default:
                    // fileIcon = <FontAwesomeIcon icon={faFile}/>;
                    fileIcon = faFile
                    break;
            }
        }
        return fileIcon;
    }

    function handleClick() {
        setSelected(!selected);
        if(isFolder) changeCurrentFolder();
    }

    function setSelected(isSelected) {
        let selected = {...files[id], selected: isSelected};
        setFlatFiles({...files, [id]: selected});
    }

    function changeCurrentFolder() {
        setCurrentFolder(id);
    }

    return (
        <Grid item className={"file-node"} onClick={handleClick}>
            <div className={"file-icon"}>
                <FontAwesomeIcon className={selected ? "selected-icon" : ""} icon={getIcon()}/>
            </div>
            <a className={selected ? "selected-text" : ""}>{name}</a>
        </Grid>);
}

function FileGrid() {
    const [currentFolder, setCurrentFolder] = useState("");
    const [flatFiles, setFlatFiles] = useState({
        "": {name: "root", type: "folder", children: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]},
        "1": {name: "1", type: "folder", children: ["1.1"]},
        "1.1": {name: "folder1.2", type: "folder", children: ["1.1.1"]},
        "1.1.1": {name: "text1.txt", extension: ".txt", selected: true},

        "2": {name: "folder2", type: "folder", children: ["2.1"]},
        "2.1": {name: "folder2.1", type: "folder", children: ["2.1.1", "2.1.2"]},
        "2.1.1": {name: "text2.txt", extension: ".txt"},
        "2.1.2": {name: "Recursion", type: "folder", children: ["2.1.1", "2.1.2"]},

        "9": {name: "folder3", type: "folder", children: ["9.1"]},
        "9.1": {name: "folder3.1", type: "folder", children: null},
        "9.1.1": {name: "text1.txt", extension: ".txt", selected: false},

        "3": {name: "test1.mkv", extension: ".mkv"},
        "4": {name: "test2.pdf", extension: ".pdf"},
        "5": {name: "test3.mp4", extension: ".mp4"},
        "6": {name: "test4.png", extension: ".png"},
        "7": {name: "test5.html", extension: ".html"},
        "8": {name: "test6.js", extension: ".js"},
    });

    let fileNodes = flatFiles[currentFolder].children.map((key) => {
        let file = flatFiles[key];
        return <FileNode
            key={key}
            id={key}
            file={file}
            files={flatFiles}
            setFlatFiles={setFlatFiles}
            setCurrentFolder={setCurrentFolder}
        />
    });

    return (<Grid className={"file-grid"} container direction={"row"}>{fileNodes}</Grid>);
}

export default FileGrid;