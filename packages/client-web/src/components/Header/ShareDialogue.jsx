import * as React from 'react';
import {DialogTitle, DialogContent, FormGroup, FormControlLabel, Switch, TextField, InputAdornment, IconButton, Grid, Divider} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QRCode from "qrcode.react";
import NoShadowDialog from "../NoShadowDialog";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import {useState} from "react";


export default function ShareDialogue(props) {
    const {open, setOpen} = props;

    const [autoConnect, setAutoConnect] = useState(true);
    const [currentPath, setCurrentPath] = useState(true);
    const {setClipboard, CopyOutcomeSnackbar, setCopySnackbarOpen} = useCopyToClipboard();

    const route = window.location.pathname.split("/")[1];
    const domainAddress = window.location.pathname.split("/")[2];
    const base64Path = window.location.pathname.split("/")[3];

    const autoConnectURL = new URL(window.location.origin);
    if(domainAddress) autoConnectURL.searchParams.append("d", domainAddress);
    if(route && route !== "create") autoConnectURL.searchParams.append("r", route);
    if(currentPath && base64Path) autoConnectURL.searchParams.append("p", base64Path);
    if(autoConnect && domainAddress) autoConnectURL.searchParams.append("a", autoConnect.toString());
    const shareLink = `${window.location.origin}/${autoConnectURL.search}`;


    const closeDialogue = () => {
        setOpen(false);
        setCopySnackbarOpen(false);
    }

    return (
        <NoShadowDialog onClose={closeDialogue} open={open}>
            <DialogTitle style={{textAlign: "center"}}>Share</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item>
                        <FormGroup>
                        <TextField
                            margin="dense"
                            variant="outlined"
                            label="Domain Address"
                            value={domainAddress}
                            InputProps={{
                                endAdornment:
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={() => setClipboard(domainAddress)}
                                        >
                                            <ContentCopyIcon/>
                                        </IconButton>
                                    </InputAdornment>
                            }}
                        />

                        <FormControlLabel control={<Switch onChange={(e) => setAutoConnect(e.target.checked)} checked={autoConnect} />} label="Auto Connect" />
                        {route === "domain" && <FormControlLabel disabled={route !== "domain"} control={<Switch onChange={(e) => setCurrentPath(e.target.checked)} checked={currentPath} />} label="Use Current Path" />}


                        <TextField
                            fullWidth
                            multiline
                            value={shareLink}
                            margin="normal"
                            variant="outlined"
                            label="URL"
                            InputProps={{
                                endAdornment:
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setClipboard(shareLink)}
                                            edge="end">
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </InputAdornment>,
                            }}
                        />
                    </FormGroup>
                    </Grid>

                    <Grid item>
                        <QRCode size={256} level={"M"} value={shareLink} />
                    </Grid>
                </Grid>
            </DialogContent>
            <CopyOutcomeSnackbar/>
        </NoShadowDialog>
    );
}