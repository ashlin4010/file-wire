/* eslint-disable */

import { useHistory } from "react-router-dom";
import React, {useEffect, useRef, useState} from "react"
import CircularProgress from '@mui/material/CircularProgress';
import useBrowserArguments from "../../hooks/useBrowserArguments";
let MP4Box = require('./mp4box.all.min');


const VideoElement = React.forwardRef((props, ref) => {
    return <video style={{maxWidth: "60vw", maxHeight: "70vh", marginLeft: "auto", marginRight: "auto", display: "block"}} controls ref={ref}/>
});

const SAMPLE_SIZE = 10;

class FileStream {

    constructor(controller, file) {
        this.controller = controller;
        this.file = file;
        this.chunkSize = 500000 / 8;
        this.offset = 0;
        this.sleepTime = 500;
        this.isRunning = false;
        this.ondata = null;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    start() {
        if(this.isRunning) return;
        this.isRunning = true;
        this.loop = this.readData();
    }

    stop() {
        if(this.isRunning) {
            this.loop.then(() => {
                this.offset = 0;
            });
        }
        this.isRunning = false;
    }

    setOffset(value) {
        let wasRunning = this.isRunning;
        this.stop();

        if(wasRunning) {
            this.loop.then(() => {
                this.offset = value;
                this.start();
            });
        } else {
            this.offset = value;
        }
    }

    readData() {
        return new Promise(async (resolve, reject) => {
            let done = false;
            while (this.isRunning) {
                console.log("reading data...");
                if(this.sleepTime) await this.sleep(this.sleepTime);
                let totalFileSize = this.file.size;

                console.log("file size:", this.file.size, "offset:", this.offset, "length:", this.chunkSize, "file:", this.file.path.full);
                // let {data, totalFileSize} = await this.reader.getByteRange(this.offset, this.chunkSize + this.offset);
                let {data, code, message} = await this.controller.readFile(this.file.path.full, {offset: this.offset, length: this.chunkSize});

                let value = new Uint8Array(data.data, 0, this.chunkSize);
                if(value && (this.offset + value.byteLength >= totalFileSize)) done = true;


                if(this.ondata) this.ondata({ done, value });
                if(done) this.isRunning = false;
                else this.offset += value.byteLength;
            }
            resolve();
        });
    }
}

export default function VideoPlayer(props) {
    const {controller, fileStore} = props;
    const history = useHistory();
    const {path, createReConnectLink} = useBrowserArguments();
    const [file, setFile] = useState(null);

    const videoElementRef = useRef(null);

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
            const video = videoElementRef.current;
            const mediaSource = new MediaSource();
            let mp4boxFile = null;
            let fileStream = null;

            mediaSource.onsourceclose = (e) => {
                console.log(e);
            }

            mediaSource.video = video;
            video.ms = mediaSource;
            video.src = window.URL.createObjectURL(mediaSource)

            video.addEventListener("play", (event) => {
                event.target.play(event);
                load();
            });

            function load() {
                if (video.ms.readyState !== "open") return;

                mp4boxFile = MP4Box.createFile();
                fileStream = new FileStream(controller, file);

                fileStream.ondata = ({ done, value }) => {
                    let buffer = value.buffer;
                    buffer.fileStart = fileStream.offset;

                    console.log(buffer.fileStart)
                    console.log(buffer);

                    let expectedNext = mp4boxFile.appendBuffer(buffer, done);
                    if(done) mp4boxFile.flush();
                    else fileStream.setOffset(expectedNext);
                };


                mp4boxFile.onReady = function (info) {
                    console.log(info);
                    fileStream.stop();
                    video.ms.duration = info.duration/info.timescale;
                    initializeAllSourceBuffers(info);
                };

                mp4boxFile.onSegment = function (id, sb, buffer, sampleNum, is_last) {
                    sb.pendingAppends.push({ id: id, buffer: buffer, sampleNum: sampleNum, is_last: is_last });
                    onUpdateEnd.call(sb, true, false);
                    if(sb.pendingAppends.length > 10) fileStream.sleepTime = 200;
                    else fileStream.sleepTime = 0;
                    console.log("Application","Received new segment for track "+id+" up to sample #"+sampleNum+", segments pending append: "+sb.pendingAppends.length);
                }

                fileStream.start();
            }

            function onInitAppended(e) {
                var sb = e.target; // source buffer
                if (sb.ms.readyState === "open") {
                    sb.sampleNum = 0; //idk
                    sb.removeEventListener('updateend', onInitAppended); // dont loop this event
                    sb.addEventListener('updateend', onUpdateEnd.bind(sb, true, true)); // do this instead

                    /* In case there are already pending buffers we call onUpdateEnd to start appending them*/
                    onUpdateEnd.call(sb, false, true);
                    sb.ms.pendingInits--;

                    if (sb.ms.pendingInits === 0) {
                        fileStream.setOffset(mp4boxFile.seek(0, true).offset);
                        console.log("header info loaded, seek read", fileStream.offset);
                        fileStream.start();
                        mp4boxFile.start();
                    }
                }
            }

            function onUpdateEnd(isNotInit, isEndOfAppend) {
                // this function does two functions
                // 1. after a sb has been updated remove samples from memory
                // 2. append data to sb
                // it run for each track each time and update is complete and when data is to be appended

                if (isEndOfAppend === true) {
                    if (this.sampleNum) {
                        mp4boxFile.releaseUsedSamples(this.id, this.sampleNum);
                        delete this.sampleNum; // why do this?
                    }
                    if (this.is_last) {
                        //this.ms.endOfStream();
                    }
                }


                if (this.ms.readyState === "open" && this.updating === false && this.pendingAppends.length > 0) {
                    var obj = this.pendingAppends.shift();
                    this.sampleNum = obj.sampleNum;
                    this.is_last = obj.is_last;
                    this.appendBuffer(obj.buffer);
                }
            }

            function addBuffer(video, mp4track) {
                let sb; // source buffer
                let ms = video.ms; // mediaSource
                let track_id = mp4track.id;
                let codec = mp4track.codec;
                let mime = 'video/mp4; codecs=\"'+codec+'\"';

                if (MediaSource.isTypeSupported(mime)) {
                    sb = ms.addSourceBuffer(mime);
                    sb.ms = ms;
                    sb.id = track_id;
                    mp4boxFile.setSegmentOptions(track_id, sb, { nbSamples: SAMPLE_SIZE } );
                    sb.pendingAppends = [];
                }
            }

            function initializeSourceBuffers() {
                var initSegs = mp4boxFile.initializeSegmentation();

                for (let i = 0; i < initSegs.length; i++) {
                    let sb = initSegs[i].user;
                    if (i === 0) sb.ms.pendingInits = 0; // define pendingInits prop

                    sb.addEventListener("updateend", onInitAppended);
                    sb.appendBuffer(initSegs[i].buffer); // append
                    sb.ms.pendingInits++; // increment init segment count
                }
            }

            function initializeAllSourceBuffers(movieInfo) {
                //
                if (movieInfo) {
                    for (let i = 0; i < movieInfo.tracks.length; i++) {
                        addBuffer(video, movieInfo.tracks[i]);
                    }
                    initializeSourceBuffers();
                }
            }

        })();
    }, [file, controller]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
    <div style={{paddingTop: "10vh"}}>
        {/*<video id="video" controls/>*/}
        <VideoElement ref={videoElementRef}/>
    </div>);
}