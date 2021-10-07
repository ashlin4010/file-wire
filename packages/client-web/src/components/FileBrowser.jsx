import React, { useState, useEffect } from 'react';
import FileGrid from "./FileGrid";

export default function FileBrowser(props) {
    /** @type {RTCController} */
    const RTCController = props.RTCController;

    useEffect(() => {
        RTCController.getFiles("./").then(console.log);
        console.log(RTCController);
    },[]);

    return (
    <div>
        <h1>FileBrowser</h1>
        <FileGrid/>
    </div>);
}