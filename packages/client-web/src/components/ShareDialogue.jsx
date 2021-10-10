import * as React from 'react';
import {DialogTitle, DialogContent, FormGroup, FormControlLabel, Switch, TextField, InputAdornment, IconButton, Snackbar, Button} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

import QRCode from "qrcode.react";
import NoShadowDialog from "./NoShadowDialog";
import {useState} from "react";


function CopyOutcomeSnackbar(props) {
    let {successful, open, setOpen, autoHideDuration} = props;
    autoHideDuration = autoHideDuration || 800;

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {return;}
        setOpen(false);
    };

    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                color="inherit"
                onClick={handleClose}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            message={successful ? "Copied to clipboard!" : "Failed to copied!"}
            action={action}
        />
    );
}


export default function ShareDialogue(props) {
    const {open, setOpen} = props;

    const [autoConnect, setAutoConnect] = useState(true);
    const [currentPath, setCurrentPath] = useState(true);
    const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
    const [copySuccessful, setCopySuccessful] = useState(true);

    const domainAddress = window.location.pathname.split("/")[2];
    const base64Path = window.location.pathname.split("/")[3];

    const autoConnectURL = new URL(window.location.origin);
    if(domainAddress) autoConnectURL.searchParams.append("d", domainAddress);
    if(currentPath && base64Path) autoConnectURL.searchParams.append("p", base64Path);
    if(autoConnect && domainAddress) autoConnectURL.searchParams.append("a", autoConnect.toString());
    const shareLink = `${window.location.origin}/${autoConnectURL.search}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                setCopySuccessful(true);
                setCopySnackbarOpen(true);
            });
    };

    const closeDialogue = () => {
        setOpen(false);
        setCopySnackbarOpen(false);
    }

    return (
        <NoShadowDialog onClose={closeDialogue} open={open}>
            <DialogTitle style={{textAlign: "center"}}>Share</DialogTitle>
            <DialogContent>
                <QRCode size={256} level={"M"} value={shareLink} />

                <FormGroup>
                    <FormControlLabel control={<Switch onChange={(e) => setAutoConnect(e.target.checked)} checked={autoConnect} />} label="Auto Connect" />
                    <FormControlLabel control={<Switch onChange={(e) => setCurrentPath(e.target.checked)} checked={currentPath} />} label="Use Current Path" />
                    <TextField
                        fullWidth
                        multiline
                        value={shareLink}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={copyToClipboard}
                                        edge="end">
                                        <ContentCopyIcon />
                                    </IconButton>
                                </InputAdornment>,
                        }}
                    />
                </FormGroup>
                <CopyOutcomeSnackbar setOpen={setCopySnackbarOpen} open={copySnackbarOpen} successful={copySuccessful}/>
            </DialogContent>
        </NoShadowDialog>
    );
}