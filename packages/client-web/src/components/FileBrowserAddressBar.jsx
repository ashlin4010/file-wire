import {Button, ButtonGroup, Grid, Paper, TextField} from "@mui/material";
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
    const { path, changePath, changePathWithHistory,navHistory} = props;
    const {addHistory, getHistory, getPreviousHistory, getNextHistory, moveBackHistory, moveForwardHistory} = navHistory;
    const [displayPath, setDisplayPath] = useState(path);

    useEffect(() => {
        setDisplayPath(path);
    },[path]);

    const handleChange = (e) => {
        let value = e.target.value || "/";
        value = value.startsWith("//") ? value.replace("//", "/") : value;
        setDisplayPath(value)
    }

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            changePathWithHistory(e.target.value);
        }
    }

    const handleNavBack = () => {
        let previous = getPreviousHistory();
        if(previous !== false) {
            changePath(previous);
            moveBackHistory();
        }
    }
    const handleNavForward = () => {
        let next = getNextHistory();
        if(next !== false) {
            changePath(next);
            moveForwardHistory();
        }
    }
    const handleNavUp = () => {
        if(path === "/") return;
        let next = path.substring(0, path.lastIndexOf('/')) || "/";
        changePathWithHistory(next);
    }

    return (
        <Grid container >
            <ButtonGroup disableElevation variant="outlined" size={"small"} aria-label="outlined primary button group">
                <Button onClick={handleNavBack}><ArrowBackIosIcon fontSize={"small"}/></Button>
                <Button onClick={handleNavForward}><ArrowForwardIosIcon fontSize={"small"}/></Button>
                <Button onClick={handleNavUp}><ArrowUpwardIcon fontSize={"medium"}/></Button>
            </ButtonGroup>
            <Grid item sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2 }}>
                <CssTextField fullWidth focused hiddenLabel size={"small"} variant="standard" value={displayPath} onChange={handleChange} onKeyUp={handleInputEnter}/>
            </Grid>
        </Grid>
    );
}