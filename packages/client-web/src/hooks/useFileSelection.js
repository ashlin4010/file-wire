//file selection
import {useState} from "react";

export default function useFileSelection(fileStore, setFileStore) {
    const [selected, setSelected] = useState({});
    const [startSelect, setStartSelect] = useState(null);
    const [endSelect, setEndSelect] = useState(null);

    const select = (isSelected, paths) => {
        paths = Array.isArray(paths) ? paths : [paths];
        let updatedSelected = {};
        paths.forEach((path) => selected[path] = {...fileStore[path], selected: isSelected});
        setSelected({...selected, ...updatedSelected});
    }
    const pushSelected = () => setFileStore({...fileStore, ...selected});
    const getSelected = () => Object.values(selected).filter((file) => file.selected);
    const handleSelection = ({file, directory, event}) => {
        event.stopPropagation();
        let {shiftKey, ctrlKey} = event;
        let rootFolder = fileStore[directory];

        if (!file) {
            select(false, rootFolder.children);
            pushSelected();
            return;
        }

        // if right click and have already have many files selected do nothing
        if(event.detail === 0) {
            let selected = new Set(getSelected());
            if(selected.has(file)) return;
        }

        if (!(shiftKey || ctrlKey)) select(false, rootFolder.children);
        if (shiftKey) {
            let startFile = startSelect || file;
            let start = rootFolder.children.indexOf(startFile.path.full);
            let end = rootFolder.children.indexOf(file.path.full);
            if (endSelect) {
                let oldEnd = rootFolder.children.indexOf(endSelect.path.full);
                if (start !== oldEnd) select(false, rootFolder.children.slice(start, oldEnd + 1));
                if (endSelect) select(false, rootFolder.children.slice(end, oldEnd + 1));
            }
            setEndSelect(file);
            select(true, rootFolder.children.slice(start, end + 1));
        }

        select(!file.selected, file.path.full);
        if (!(shiftKey)) setStartSelect(file);
        pushSelected();
    }


    return {select, pushSelected, handleSelection, getSelected: getSelected, setSelected};
}