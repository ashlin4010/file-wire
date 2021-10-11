import {AppBar, Button, Grid, IconButton, Toolbar} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {Link} from "react-router-dom";
import "./NavBar.css";
import logo from "../../assets/FileWire.svg";
import React, {useState} from "react";
import ShareDialogue from "./ShareDialogue";

export default function NavBar() {

    const [shareOpen, setShareOpen] = useState(false);

    return (
    <nav>
        <AppBar position="static">
            <Toolbar>
                <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Grid item>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            sx={{mr: 2}}
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Grid>

                    <Grid item>
                        <Link className={"icon-root"} to="/">
                            <img alt="logo" aria-label="Logo" className={"image-icon"} src={logo}/>
                        </Link>
                    </Grid>

                    <Grid item>
                        <Button onClick={() => setShareOpen(true)} variant="contained" color="secondary" disableElevation>Share</Button>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
        <ShareDialogue open={shareOpen} setOpen={setShareOpen}/>
    </nav>);
}