import React, {useEffect} from "react";
import FileBrowserAddressBar from "../FileBrowser/FileBrowserAddressBar";
import FileGrid from "../FileBrowser/FileGrid";
import useFileSelection from "../../hooks/useFileSelection";

export default function BrowserWindow(props) {

    const {path, fileStore, onOpen, onPathChange, onNav, onSelect} = props;

return (
    <React.Fragment>
        <FileBrowserAddressBar
            path={path}
            onPathChange={(path) => {onPathChange(path, true)}}
            onLocationNext={() => onNav("next")}
            onLocationPrevious={() => onNav("previous")}
            onLocationUp={() => onNav("up")}
        />
        <FileGrid
            style={{padding:"20px"}}
            path={path}
            fileStore={fileStore}
            onOpenClick={onOpen}
            onContextMenu={() => {}}
            onSelect={onSelect}
        />
    </React.Fragment>
);


}