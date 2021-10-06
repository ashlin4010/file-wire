import {Box, Button, Grid, Paper, TextField, Typography} from "@mui/material";
import { withStyles } from '@mui/styles';
import React, {useState} from "react";
import {Link, useHistory} from "react-router-dom";

const CssTextField = withStyles({
    root: {
        '& label.Mui-focused': {
            color: 'white',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'yellow',
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
    const {defaultValue} = props
    const history = useHistory();
    const [domainAddress, setDomainAddress] = useState(defaultValue);

    const handleChange = (event) => {
        setDomainAddress(event.target.value);
    }

    const handleConnect = (e) => {
        if(domainAddress) history.push(`/domain/${domainAddress}`);
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
            }}
        >
            <Paper elevation={3}>
                <Grid
                    container
                    direction={"column"}
                >
                    <Typography variant={"h6"}>Enter Domain Address</Typography>
                    <CssTextField onChange={handleChange} margin="normal" size={"small"} color="primary" label="Domain" variant="outlined" defaultValue={domainAddress} placeholder={"#Domain"} />
                    <Button variant="contained" onClick={handleConnect}>Connect</Button>
                    <Button disabled style={{marginTop: 32}} variant="contained">Create New Domain</Button>
                </Grid>
            </Paper>
        </Box>
    );
}