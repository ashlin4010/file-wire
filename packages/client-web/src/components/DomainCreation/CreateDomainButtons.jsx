import React, {useEffect, useState} from "react";
import {Button, Grid, IconButton, InputAdornment, TextField} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CasinoIcon from "@mui/icons-material/Casino";
import {withStyles} from "@mui/styles";
import {useHistory} from "react-router-dom";
import ShareDialogue from "../Header/ShareDialogue";


const CssTextField = withStyles({
    root: {
        margin: 0,
        paddingTop: 16,
        '& label.Mui-focused': {
            color: 'white',
        },
        "& .MuiInputLabel-root": {
            color: "white",
        },
        "& .MuiOutlinedInput-input": {
            color: "white"
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'white',
            },
            '&:hover fieldset': {
                borderColor: '#1976d2',
            },
        },
    },
})(TextField);

export default function CreateDomainButtons(props) {
    const {setDomain, domain, onConnect, onDisconnect, onNewFolder, onRemoveSelected, onAddFile} = props;
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const history = useHistory();

    const handleConnect = (event) => {
        const success = () => {setLoading(false); setConnected(true)};
        const error = () => {setLoading(true); setConnected(false)};
        setLoading(true);
        if(onConnect) onConnect(event, success, error);
    }

    const handleDisconnect = (event) => {
        const success = () => {setLoading(false); setConnected(false)};
        const error = () => {setLoading(false); setConnected(true)};
        setLoading(true);
        if(onDisconnect) onDisconnect(event, success, error);
    }

    const handleDomainChange = (domain) => {
        setDomain(domain);
        history.push(`/create/${domain}`);
    }

    useEffect(() => {
        history.push(`/create/${domain}`);
    },[]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <React.Fragment>
            <Grid sx={{ width: '20ch' }} container direction={"column"} justifyContent={"space-between"} spacing="8">
                <Grid item>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onNewFolder}
                        disabled={connected || loading}
                    >Create Folder</Button>
                </Grid>
                <Grid item>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onAddFile}
                        disabled={connected || loading}
                    >Add Files</Button>
                </Grid>
                <Grid item>
                    <Button
                        fullWidth
                        color="error"
                        variant="contained"
                        onClick={onRemoveSelected}
                        disabled={connected || loading}
                    >Remove</Button>
                </Grid>

                <Grid item>
                    <CssTextField
                        size="small"
                        margin="dense"
                        variant="outlined"
                        value={domain}
                        disabled={connected || loading}
                        onChange={(e) => handleDomainChange(e.target.value)}
                        InputProps={{
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        sx={{color: "white"}}
                                        edge="end"
                                        disabled={connected || loading}
                                        onClick={() => handleDomainChange((Math.random() + 1).toString(36).substring(7).toUpperCase())}
                                    >
                                        <CasinoIcon />
                                    </IconButton>
                                </InputAdornment>,
                        }}
                    />
                </Grid>

                <Grid item>
                    <LoadingButton
                        fullWidth
                        disableElevation
                        color={connected ? "error": "success"}
                        variant="contained"
                        onClick={connected ? handleDisconnect : handleConnect}
                        loading={loading}
                    >
                        {connected ? "Close Share": "Open Share"}
                    </LoadingButton>
                </Grid>


                <Grid item>
                    <Button
                        fullWidth
                        disableElevation
                        color="secondary"
                        variant="contained"
                        onClick={() => setShareOpen(true)}
                    >Get Link</Button>
                </Grid>
            </Grid>
            <ShareDialogue open={shareOpen} setOpen={setShareOpen}/>
        </React.Fragment>
    );

}