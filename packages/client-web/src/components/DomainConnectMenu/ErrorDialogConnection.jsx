import {Button, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";
import NoShadowDialog from "../NoShadowDialog";


export default function ErrorDialogConnection(props) {
    let {title, message, open, onClose, onRetry} = props;
    title = title || "Failed to Connect";
    message = message || `
        FileWire was unable to connect to the remote file share.
        This may be because the share is off line or unavailable.`;

    return (
        <NoShadowDialog open={open} onClose={onClose}>
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={onRetry}>Retry</Button>
            </DialogActions>
        </NoShadowDialog>
    );
}