import React, {useState} from "react";
import { withStyles } from '@mui/styles';
import { useHistory } from "react-router-dom";
import {Box, Button, Grid, Paper, TextField, Typography} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import ErrorDialogConnection from "./ErrorDialogConnection";

const CssLoadingButton = withStyles({
    loadingIndicator: {
        color: "white !important"
    }
})(LoadingButton);

const CssTextField = withStyles({
    root: {
        '& label.Mui-focused': {
            color: 'white',
        },
        "& .MuiInputLabel-root": {
            color: "white"
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

export default function DomainConnectMenu(props) {
    const {defaultValue, onConnect, RTCController, domain} = props;
    const history = useHistory();
    const [currentDomainInput, SetCurrentDomainInput] = useState(defaultValue);
    const [loading, setLoading] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const isConnected = RTCController !== null;


    const handleChange = (event) => {
        SetCurrentDomainInput(event.target.value);
    }

    const handleConnect = () => {
        if(isConnected) {
            history.push(`/domain/${domain}`);
        } else {
            setLoading(true);
            setErrorOpen(false);
            if (onConnect) onConnect(currentDomainInput, openError);
        }
    }

    const openError = () => {
        setErrorOpen(true);
        setLoading(false);
    }

    const closeError = () => {
        setLoading(false);
        setErrorOpen(false);
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: "space-around",
                marginTop: "20vh",
                '& > :not(style)': {
                    m: 1,
                    color: "#ffffff",
                    backgroundColor: "#34425A",
                    padding: "20px"
                },
            }}>
            <Paper elevation={3}>
                <Grid container direction={"column"}>
                    <Typography variant={"h6"}>Enter Domain Address</Typography>
                    <CssTextField
                        onChange={handleChange}
                        margin="normal"
                        size={"small"}
                        color="primary"
                        label="Domain"
                        variant="outlined"
                        defaultValue={domain}
                        placeholder={"#Domain"}
                        disabled={isConnected}
                    />
                    <CssLoadingButton
                        disabled={currentDomainInput.length < 4}
                        onClick={handleConnect}
                        loading={loading}
                        variant="contained">
                        {isConnected ? "Resume" : "Connect"}
                    </CssLoadingButton>
                    {isConnected && <Button color="error" style={{marginTop: 8}} variant="outlined">Disconnect</Button>}
                    <Button disabled style={{marginTop: 32}} variant="contained">Create New Domain</Button>
                    {/*<Button onClick={openError} style={{marginTop: 32}} variant="contained">Test Error</Button>*/}
                </Grid>
            </Paper>
            <ErrorDialogConnection
                open={errorOpen}
                onClose={closeError}
                onRetry={handleConnect}
            />
        </Box>
    );
}