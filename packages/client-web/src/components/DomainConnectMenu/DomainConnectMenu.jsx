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
    let {onConnect, RTCController, domain, setDomain, onCreateDomain} = props;

    let {a: autoConnect, p:path, d: queryDomain, r: route} = useQuery();
    domain = queryDomain ? queryDomain : domain;
    path = path ? path : "Lw==";
    route = route ? route : "domain";

    const [loading, setLoading] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const history = useHistory();
    const isConnected = RTCController !== null;
    const [currentDomainInput, setCurrentDomainInput] = useState(domain);

    // http://localhost:3000/?a=true&p=Lw%3D%3D&domain=testing

    const handleChange = (event) => {
        let domainAddress = event.target.value.toUpperCase();
        console.log(domainAddress);
        setDomain(domainAddress);
        setCurrentDomainInput(domainAddress);
    }

    const completeConnect = () => {
        history.push(`/${route}/${domain}/${path}`);
    };

    const beginConnect = () => {
        if(isConnected) {
            completeConnect();
        } else {
            setLoading(true);
            setErrorOpen(false);
            if (onConnect) onConnect(domain, openError, completeConnect);
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

    useEffect(() => {
        setDomain(currentDomainInput);
        if(autoConnect === "true") beginConnect();
    },[]); // eslint-disable-line react-hooks/exhaustive-deps

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
                        label="Domain Address"
                        value={currentDomainInput}
                        variant="outlined"
                        placeholder={"Domain Address"}
                        disabled={isConnected}
                    />
                    <CssLoadingButton
                        onClick={beginConnect}
                        disabled={domain.length < 4}
                        loading={loading}
                        variant="contained">
                        {isConnected ? "Resume" : "Connect"}
                    </CssLoadingButton>
                    {isConnected && <Button onClick={disconnect} color="error" style={{marginTop: 8}} variant="contained">Disconnect</Button>}
                    <Button onClick={onCreateDomain} style={{marginTop: 32}} variant="contained">Create New Domain</Button>
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