import React, {useState} from "react";
import {Grid, Icon, IconButton, SvgIcon} from "@mui/material";
import "./FileTree.css";
import mime from "mime-types";

import AutorenewIcon from "@mui/icons-material/Autorenew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFolderOpen, faFile,faFileVideo, faFileImage, faFileAlt, faFilePdf, faFileArchive, faFileCode} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-solid-svg-icons/faFileAudio";

function FileDropDown(props) {
    const id = props.id;
    const {name, extension, selected} = props.file;
    const type = props.file?.type || "file"; // file | folder
    const isFolder = type === "folder";
    const files = props.files;
    const setFlatFiles = props.setFlatFiles;
    const [open, setOpen] = useState(false);

    let numberOfChildren = props.children?.length | 0;
    let childrenDropdown = (<div className={"dropdown-container"}>{open && props.children}</div>);
    let loadingDropdown = (<div className={"dropdown-loading"}>{open && <AutorenewIcon className={"spin"} fontSize={"small"}/>}</div>);
    let dropdown = numberOfChildren > 0 ? childrenDropdown : loadingDropdown;

    function getIcon() {
        // if (isFolder) return <FolderIcon/>;
        if (isFolder) return <FontAwesomeIcon icon={open ? faFolderOpen : faFolder} />;
        let mimeType = mime.lookup(extension) || "application/octet-stream";
        let type = mimeType.split("/")[0];
        let format = mimeType.split("/")[1];
        let fileIcon;
        if (type === "application" || type === "text") {
            switch (format) {
                case "plain":
                    fileIcon = <FontAwesomeIcon icon={faFileAlt} />;
                    break;
                case "pdf":
                    fileIcon = <FontAwesomeIcon icon={faFilePdf} />;
                    break;
                case "javascript":
                case "html":
                    fileIcon = <FontAwesomeIcon icon={faFileCode} />
                    break;
                case "zip":
                    fileIcon = <FontAwesomeIcon icon={faFileArchive} />
                    break;
                default:
                    fileIcon = <FontAwesomeIcon icon={faFile} />;
                    break;
            }
        } else {
            switch (type) {
                case "video":
                    fileIcon = <FontAwesomeIcon icon={faFileVideo} />
                    break;
                case "image":
                    fileIcon = <FontAwesomeIcon icon={faFileImage} />
                    break;
                case "audio":
                    fileIcon = <FontAwesomeIcon icon={faFileAudio} />
                    break;
                default:
                    fileIcon = <FontAwesomeIcon icon={faFile} />;
                    break;
            }
        }
        return fileIcon;
    }

    function getFiles() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("got files");
                resolve([{name: "folder3.1", type: "folder", children: null}])
            }, 500)
        })
    }

    function setSelected(isSelected) {
        let selected = {...files[id], selected: isSelected};
        setFlatFiles({...files, [id]: selected});
    }

    function setChildrenFiles(newFiles) {
        // remove old files
        let copyFiles = {...files};
        let parentFolder = copyFiles[id];
        parentFolder.children = parentFolder.children ? parentFolder.children : [];
        parentFolder.children.forEach((child) => delete copyFiles[child]);
        newFiles.forEach((file, index) => {
            let newId = `${id}.${index + 1}`;
            copyFiles[newId] = file;
            parentFolder.children = parentFolder.children ? [...parentFolder.children, newId] : [newId];
        });
        setFlatFiles(copyFiles);
    }

    function handleDropDownToggle() {
        setOpen(!open);
        if (numberOfChildren === 0) {
            (async () => {
                let newFiles = await getFiles();
                setChildrenFiles(newFiles);
            })();
        }
    }

    return (<div>
        <Grid className={selected ? "selected" : ""} container alignItems="center">
            {/* Dropdown button*/}
            <IconButton
                color="primary"
                disabled={!isFolder}
                size={"small"}
                onClick={handleDropDownToggle}>
                {isFolder ? (open ? <ExpandMoreIcon/> : <ChevronRightIcon/>) : <Icon/>}
            </IconButton>

            {/* file name */}
            <Grid item className={"dropdown-label"} onClick={() => setSelected(!selected)}>
                <Grid container alignItems="center">
                    <Icon>{getIcon()}</Icon>
                    <div className={"dropdown-label-text"}>{name}</div>
                </Grid>
            </Grid>
        </Grid>
        {isFolder && dropdown}
    </div>);
}

function FileNode(props) {
    // loop over all files and find children (not the most efficient approach)
    // let fileNodes = Object.entries(props.files).filter(([key, file]) => {
    //     return key.slice(undefined,-2) === props.id;
    // }).map(([key, file]) => <FileNode file={file} files={props.files} id={key}/>);

    let fileNodes = props.file.children?.map(
        key =>
            <FileNode
                key={key}
                id={key}
                file={props.files[key]}
                files={props.files}
                setFlatFiles={props.setFlatFiles}
            />
    );
    return (
        <FileDropDown
            id={props.id}
            file={props.file}
            files={props.files}
            setFlatFiles={props.setFlatFiles}
        >{fileNodes}</FileDropDown>);
}

function FileTree() {

    // use of children is faster than looping over the complete list
    const [flatFiles, setFlatFiles] = useState({
        "1": {name: "folder1", type: "folder", children: ["1.1"]},
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

    let fileNodes = Object.entries(flatFiles).map(
        ([key, file]) => key.length === 1 ?
            <FileNode
                key={key}
                id={key}
                file={file}
                files={flatFiles}
                setFlatFiles={setFlatFiles}
            /> : undefined
    );

    return (<div>{fileNodes}</div>)
}

export default FileTree;