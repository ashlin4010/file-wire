import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import useBrowserArguments from "../../hooks/useBrowserArguments";
import {encode} from "js-base64";
import ContentFrame from "../ContentFrame";
import {Paper} from "@mui/material";

export default function TextViewer(props) {
    const {controller, fileStore} = props;
    const history = useHistory();
    const {path, createReConnectLink, domainAddress} = useBrowserArguments();
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");


    const returnToBrowser = () => {
        history.push(`/domain/${domainAddress}/${encode(file.path.dir)}`);
    }

    useEffect(() => {
        (async () => {
            if (controller === null) return history.push(createReConnectLink());
            let fileStats = fileStore[path] ? fileStore[path] : (await controller.getFileStats(path)).data;
            setFile(fileStats);
        })();
    },[path, controller]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        (async() => {
            if(file === null) return;
            setText("");
            let chunkSize = 16000;
            let fileSize = file.size;
            let lastChunkOffset = (fileSize / chunkSize >> 0) * chunkSize;
            let lastChunkOffsetLength = fileSize % chunkSize;
            let {data} = await controller?.readFile(file.path.full, {offset: lastChunkOffset, length:lastChunkOffsetLength});
            let utf8decoder = new TextDecoder();
            setText(utf8decoder.decode(new Uint8Array(data.data, 0, chunkSize)))

        })();
    },[file, controller]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <ContentFrame name={file && file.name} onBack={returnToBrowser} loading={!text}>
            <Paper style={{width: "60vw", height: "60vh",textAlign: "start", padding: 10}}>
                <p>{!!text && text}</p>
            </Paper>
        </ContentFrame>);

}