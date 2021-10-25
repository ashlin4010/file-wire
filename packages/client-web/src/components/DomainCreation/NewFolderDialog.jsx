import {Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import NoShadowDialog from "./../NoShadowDialog";


export default function ErrorDialogConnection(props) {
    let {title, message, open, onClose, onCreate} = props;
    title = title || "Create Folder";
    const [value, setValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [inError, setInError] = useState(false);

    const error = (message) => {
        setErrorMessage(message);
        setInError(true);
    }

    useEffect(() => {
        setErrorMessage("");
        setInError(false);
    },[value]);

    useEffect(() => {
        setValue('');
        setErrorMessage("");
        setInError(false);
    }, [open]);


    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            // e.target.blur();
            if(onCreate) onCreate(e.target.value, error);
        }
    }

    return (
        <NoShadowDialog keepMounted={false} open={open} onClose={onClose}>
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
                <TextField
                    autoFocus
                    error={inError}
                    helperText={errorMessage}
                    value={value} onChange={(e) => setValue(e.target.value)}
                    onKeyUp={handleInputEnter}
                    placeholder="Name"
                    variant="standard" />
            </DialogContent>


            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="outlined" onClick={() => onCreate(value, error)}>Create</Button>
            </DialogActions>
        </NoShadowDialog>
    );
}