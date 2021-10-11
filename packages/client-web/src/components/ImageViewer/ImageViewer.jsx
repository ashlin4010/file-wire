import { useHistory } from "react-router-dom";
import React, {useEffect, useState} from "react"
import CircularProgress from '@mui/material/CircularProgress';
import useBrowserArguments from "../../hooks/useBrowserArguments";

export default function ImageViewer(props) {
    const {controller, fileStore} = props;
    const history = useHistory();
    const {path, createReConnectLink} = useBrowserArguments();
    const [imageUrl, setImageURL] = useState(null);
    const [file, setFile] = useState(null);

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
            setImageURL(null);
            let chunkSize = 40000;
            let fileSize = file.size;
            let lastChunkOffset = (fileSize / chunkSize >> 0) * chunkSize;
            let lastChunkOffsetLength = fileSize % chunkSize;
            let fileDataChunks = [];

            for(let i = 0; i < (fileSize / chunkSize >> 0); i++) {
                let offset = i * chunkSize;
                let length = chunkSize
                let {data} = await controller.readFile(file.path.full, {offset, length});
                fileDataChunks.push(new Uint8Array(data.data, 0, chunkSize));
            }

            let {data} = await controller.readFile(file.path.full, {offset: lastChunkOffset, length:lastChunkOffsetLength});
            fileDataChunks.push(new Uint8Array(data.data, 0, chunkSize));

            let blob = new Blob(fileDataChunks);
            const objectURL = URL.createObjectURL(blob);
            setImageURL(objectURL);
        })();
    },[file, controller]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div style={{textAlign: "center", paddingTop: 50}}>
            {file && file.name}
            <br/>
            {imageUrl === null && <CircularProgress style={{marginTop: 50}}/> }
            <img alt={file && file.name}
                style={{maxWidth: "60vw", marginLeft: "auto", marginRight: "auto", display: "block"}}
                src={imageUrl !== null ? imageUrl : undefined}
            onLoad={() => URL.revokeObjectURL(imageUrl)}/>
        </div>
    );

}