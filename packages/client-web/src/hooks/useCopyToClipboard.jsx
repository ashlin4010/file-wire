import * as React from 'react';
import {useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import {IconButton, Snackbar} from '@mui/material';

export default function useCopyToClipboard() {
    const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
    const [copySuccessful, setCopySuccessful] = useState(true);

    const CopyOutcomeSnackbar = (props)  => {
        let {autoHideDuration} = props;
        autoHideDuration = autoHideDuration || 1000;

        const handleClose = (event, reason) => {
            if (reason === 'clickaway') {
                return;
            }
            setCopySnackbarOpen(false);
        };

        const action = (
            <React.Fragment>
                <IconButton
                    size="small"
                    color="inherit"
                    onClick={handleClose}
                >
                    <CloseIcon fontSize="small"/>
                </IconButton>
            </React.Fragment>
        );

        return (
            <Snackbar
                open={copySnackbarOpen}
                autoHideDuration={autoHideDuration}
                onClose={handleClose}
                message={copySuccessful ? "Copied to clipboard!" : "Failed to copied!"}
                action={action}
            />
        );
    }

    const copyToClipboard = (text) => {
        if(!text) return;
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopySuccessful(true);
                setCopySnackbarOpen(true);
            });
    };

    return {setClipboard: copyToClipboard, CopyOutcomeSnackbar, setCopySnackbarOpen};

}