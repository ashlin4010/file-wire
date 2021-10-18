import {Box, Grid, IconButton, Paper} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";

export default function ContentFrame(props) {
    const {name, loading, onBack} = props;
    return (
        <Box
        sx={{
            paddingTop: 8,
            marginLeft: "auto",
            marginRight: "auto",
            width: "fit-content",
            '& > :not(style)': {
                m: 1,
                color: "#ffffff",
                backgroundColor: "#34425A",
                padding: "20px"
            },
        }}
        style={props.style}>
        <Paper style={{textAlign: "center", padding: 0}}>
            <Grid style={{paddingRight: 50}} container alignItems="center">
                {!!onBack &&
                    <IconButton onClick={onBack} color={"inherit"} aria-label="delete">
                        <ArrowBackIcon/>
                    </IconButton>
                }
                {!!name && <h3 style={{marginLeft: onBack ? 0 : 16}}>{name}</h3>}
            </Grid>
            {loading ? <CircularProgress style={{margin: 50}}/> : props.children }
            {/*<img alt={file && file.name}*/}
            {/*     style={{maxWidth: "60vw", maxHeight: "70vh", marginLeft: "auto", marginRight: "auto", display: "block"}}*/}
            {/*     src={imageUrl !== null ? imageUrl : undefined}*/}
            {/*     onLoad={() => URL.revokeObjectURL(imageUrl)}/>*/}
        </Paper>
    </Box>);
}