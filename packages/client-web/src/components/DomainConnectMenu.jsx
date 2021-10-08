import React, {useEffect, useState} from "react";
import { withStyles } from '@mui/styles';
import { useHistory, useLocation } from "react-router-dom";
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

function useQuery() {
    return Object.fromEntries(new URLSearchParams(useLocation().search));
}

export default function DomainConnectMenu(props) {
    let {defaultValue, onConnect, RTCController, domain, setDomain} = props;
    let {a: autoConnect, p:path, d: queryDomain} = useQuery();
    defaultValue = queryDomain ? queryDomain : defaultValue;
    path = path ? path : "Lw==";
    const [currentDomainInput, setCurrentDomainInput] = useState(defaultValue);
    const [loading, setLoading] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const history = useHistory();
    const isConnected = RTCController !== null;

    // http://localhost:3000/?autoConnect=true&path=Lw%3D%3D&domain=testing

    const handleChange = (event) => {
        setCurrentDomainInput(event.target.value);
    }

    const completeConnect = () => history.push(`/domain/${domain}/${path}`);

    const beginConnect = () => {
        if(isConnected) {
            completeConnect();
        } else {
            setLoading(true);
            setErrorOpen(false);
            if (onConnect) onConnect(currentDomainInput, openError, completeConnect);
        }
    }

    const disconnect = () => {
        if(isConnected) RTCController.close();
    };

    const openError = () => {
        setErrorOpen(true);
        setLoading(false);
    }

    const closeError = () => {
        setLoading(false);
        setErrorOpen(false);
    }

    useEffect(() => {if(autoConnect === "true") beginConnect()},[]);

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
                        defaultValue={defaultValue}
                        placeholder={"#Domain"}
                        disabled={isConnected}
                    />
                    <CssLoadingButton
                        onClick={beginConnect}
                        disabled={currentDomainInput.length < 4}
                        loading={loading}
                        variant="contained">
                        {isConnected ? "Resume" : "Connect"}
                    </CssLoadingButton>
                    {isConnected && <Button onClick={disconnect} color="error" style={{marginTop: 8}} variant="outlined">Disconnect</Button>}
                    <Button disabled style={{marginTop: 32}} variant="contained">Create New Domain</Button>
                    {/*<Button onClick={openError} style={{marginTop: 32}} variant="contained">Test Error</Button>*/}
                </Grid>
            </Paper>
            <ErrorDialogConnection
                open={errorOpen}
                onClose={closeError}
                onRetry={beginConnect}
            />
        </Box>
    );
}