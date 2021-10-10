import {useState} from "react";

export default function useNavigationHistory() {
    const [navigationHistory, setNavigationHistory] = useState([]);
    const [navigationIndex, setNavigationIndex] = useState(0);

    const addHistory = (path) => {
        let n = navigationHistory.slice(0, navigationIndex + 1);
        n.push(path);
        setNavigationHistory(n);
        if(navigationHistory.length > 0) setNavigationIndex(navigationIndex + 1);
    }
    const getHistory = (index=navigationIndex) => navigationHistory[index] || false;
    const getPreviousHistory = () => {
        if(navigationIndex < 1) return false;
        return navigationHistory[navigationIndex - 1];
    }
    const getNextHistory = () => {
        if(navigationIndex + 1 >= navigationHistory.length) return false;
        return navigationHistory[navigationIndex + 1];
    }
    const moveBackHistory  = () => {
        if(navigationIndex < 1) return false;
        setNavigationIndex(navigationIndex - 1);
    }
    const moveForwardHistory  = () => {
        if(navigationIndex + 1 >= navigationHistory.length) return false;
        setNavigationIndex(navigationIndex + 1);
    }

    return {add: addHistory, get: getHistory, previous: getPreviousHistory, next: getNextHistory, goBack:moveBackHistory, goForward: moveForwardHistory};

}
