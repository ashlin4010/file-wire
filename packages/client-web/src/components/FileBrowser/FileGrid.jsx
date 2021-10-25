import React from "react";
import {Grid,} from "@mui/material";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import "./FileGrid.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFile,faFileVideo, faFileImage, faFileAlt, faFilePdf, faFileArchive, faFileCode, faFileDownload} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-solid-svg-icons/faFileAudio";

const NoMaxWidthTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 'none',
    },
});

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
            if(onSelect) onSelect({file, directory: path, event});
        } else if (event.detail === 2) {
            if(onOpenClick) onOpenClick({file, directory: path, event});
        }
    }

    const handleContextMenu = ({file, event})  => {
        event.stopPropagation();
        onSelect({file, directory: path, event});
        if(onContextMenu) onContextMenu({file, directory: path, event});
    }

    return (
        <Grid
            style={props.style}
            container
            className={"file-grid"}
            direction={"row"}
            onClick={(event) => onSelect({file: null, directory: path, event})}
            onContextMenu={(event) => handleContextMenu({file: null, event})}
        >
            {fileStore && fileStore[path]?.children?.map((filePath) => <FileNode
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
    const shortName = name.substring(0, 20);

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
                case "x-bittorrent":
                    fileIcon = faFileDownload
                    color = "#f18b0f"
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
        if(onSelect) onSelect({file, event});
    }

    function handleContextMenu(event) {
        event.stopPropagation();
        onSelect({file, event});
        if(onContextMenu) onContextMenu({file, event});
    }

    return (
        <NoMaxWidthTooltip title={name} placement="top"  enterDelay={500}>
        <Grid item className={"file-node"}>
            <div
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                <div className={"file-icon"}>
                    <FontAwesomeIcon
                        style={{color: getIconAndColor(mineType)[1]}}
                        className={selected ? "selected-icon" : ""}
                        icon={getIconAndColor(mineType)[0]}/>
                </div>
                <p style={{margin: 0}} className={selected ? "selected-text" : ""}>{shortName}</p>
            </div>
        </Grid>
        </NoMaxWidthTooltip>
    );
}