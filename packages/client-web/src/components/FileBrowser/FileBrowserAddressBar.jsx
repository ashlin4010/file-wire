import {Button, ButtonGroup, Grid, TextField} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import React, {useState, useEffect} from "react";
import {withStyles} from "@mui/styles";

const CssTextField = withStyles({
    root: {
        "& .MuiInputBase-input": {
            color: "white",
            paddingLeft: "8px",
            paddingTop: "5px",
            paddingBottom: "1px"
        },
    },
})(TextField);

export default function FileBrowserAddressBar(props) {
    const {
        path,
        onPathChange,
        onLocationNext,
        onLocationPrevious,
        onLocationUp
    } = props;

    const [displayPath, setDisplayPath] = useState(path);

    useEffect(() => {
        setDisplayPath(path);
    },[path]);

    const changeDisplayPath = (path) => {
        let value = path || "/";
        value = value.startsWith("//") ? value.replace("//", "/") : value;
        setDisplayPath(value);
    }

    const handleChange = (e) => {
        // allow the user to update DisplayPath
        // but dont allow them to set it
        changeDisplayPath(e.target.value);
    }

    const handleInputEnter = (e) => {
        // allow the user to update DisplayPath
        // but dont allow them to set it
        // set display past should come from path
        if (e.key === 'Enter') {
            e.target.blur();
            onPathChange(e.target.value);
            changeDisplayPath(path);
        }
    }


    return (
        <Grid container >
            <ButtonGroup disableElevation variant="outlined" size={"small"} aria-label="outlined primary button group">
                <Button onClick={onLocationPrevious}><ArrowBackIosIcon fontSize={"small"}/></Button>
                <Button onClick={onLocationNext}><ArrowForwardIosIcon fontSize={"small"}/></Button>
                <Button onClick={onLocationUp}><ArrowUpwardIcon fontSize={"medium"}/></Button>
            </ButtonGroup>
            <Grid item sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2 }}>
                <CssTextField fullWidth focused hiddenLabel size={"small"} variant="standard" value={displayPath} onChange={handleChange} onKeyUp={handleInputEnter}/>
            </Grid>
        </Grid>
    );
}