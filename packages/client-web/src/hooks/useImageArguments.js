import {useParams} from "react-router-dom";
import {decode} from "js-base64";

function safeDecode(string) {
    string = string || "";
    if(string === "") return "";
    try {
        return decode(string);
    } catch (e) {
        return "";
    }
}


export default function useBrowserArguments () {
    const {base64Path } = useParams();
    const path = safeDecode(base64Path) || "/"
    return {base64Path, path};
}