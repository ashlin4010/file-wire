import { useHistory } from "react-router-dom";
import React, {useEffect, useState} from "react"
import useBrowserArguments from "../../hooks/useBrowserArguments";
import {encode} from "js-base64";
import ContentFrame from "../ContentFrame";

export default function AudioPlayer(props) {
    const {controller, fileStore} = props;
    const history = useHistory();
    const {path, createReConnectLink, domainAddress} = useBrowserArguments();
    const [audioUrl, setAudioURL] = useState(null);
    const [file, setFile] = useState(null);

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
            setAudioURL(null);
            let chunkSize = 16000;
            let fileSize = file.size;
            let lastChunkOffset = (fileSize / chunkSize >> 0) * chunkSize;
            let lastChunkOffsetLength = fileSize % chunkSize;
            let fileDataChunks = [];

            for(let i = 0; i < (fileSize / chunkSize >> 0); i++) {
                let offset = i * chunkSize;
                let length = chunkSize
                let {data} = await controller?.readFile(file.path.full, {offset, length});
                fileDataChunks.push(new Uint8Array(Object.values(data), 0, chunkSize));
            }

            let {data} = await controller?.readFile(file.path.full, {offset: lastChunkOffset, length:lastChunkOffsetLength});
            fileDataChunks.push(new Uint8Array(Object.values(data), 0, lastChunkOffsetLength));

            let blob = new Blob(fileDataChunks, {type: file.type});
            const objectURL = URL.createObjectURL(blob);
            setAudioURL(objectURL);
        })();
    },[file, controller]); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <ContentFrame name={file && file.name} onBack={returnToBrowser} loading={audioUrl === null}>
            <audio controls
                 style={{width: "100%", marginLeft: "auto", marginRight: "auto", display: "block"}}
                 src={audioUrl !== null ? audioUrl : undefined}
                 onLoad={() => URL.revokeObjectURL(audioUrl)}/>
        </ContentFrame>
    );

}