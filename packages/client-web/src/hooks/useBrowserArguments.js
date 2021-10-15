import {useParams} from "react-router-dom";
import {decode} from "js-base64";
import {useEffect, useRef} from "react";

function safeDecode(string) {
    string = string || "";
    if(string === "") return "";
    try {
        return decode(string);
    } catch (e) {
        return "";
    }
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default function useBrowserArguments () {
    const { domainAddress, base64Path } = useParams();
    const path = safeDecode(base64Path);
    const prevPath = safeDecode(usePrevious(base64Path));
    const route = window.location.pathname.split("/")[1];
    const createReConnectLink = (autoConnect=true) => {
        const autoConnectURL = new URL(window.location.origin);
        autoConnectURL.searchParams.append("d", domainAddress);
        if(route) autoConnectURL.searchParams.append("r", route);
        if(base64Path) autoConnectURL.searchParams.append("p", base64Path);
        if(autoConnect) autoConnectURL.searchParams.append("a", "true");
        return (`/${autoConnectURL.search}`);
    }
    return {domainAddress, base64Path, path: path || "/", prevPath, createReConnectLink};
}