import {Box, Grid, Paper} from "@mui/material";
import NewFolderDialog from "./NewFolderDialog";
import BrowserWindow from "./BrowserWindow";
import React, {useState} from "react";
import CreateDomainButtons from "./CreateDomainButtons";


export default function CreateDomainWindow(props) {
    const {
        domain,
        setDomain,
        path,
        fileStore,
        addFolder,
        addFile,
        removeSelected,
        onOpen,
        onPathChange,
        onNav,
        onSelect,
        onConnect,
        onDisconnect
    } = props;

    const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);

    return (
        <Box
            sx={{
                marginTop: 4,
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: "60%"
            }}>
            <NewFolderDialog
                open={newFolderDialogOpen}
                onClose={() => setNewFolderDialogOpen(false)}
                onCreate={(name, error) => {
                    if(name === "") return error("Invalid Name");
                    let success = addFolder(name);
                    if(success) setNewFolderDialogOpen(false);
                    else error("Folder Already Exists");
                }}
            />
            <Grid container
                sx={{
                    marginTop: 4,
                    marginLeft: "auto",
                    marginRight: "auto",
                    '& > :not(style)': {
                      m: "4px",
                      color: "#ffffff",
                      backgroundColor: "#34425A",
                      padding: "10px"
                    },
                }}
            >
                <Paper>
                    <CreateDomainButtons
                        setDomain={setDomain}
                        domain={domain}
                        onConnect={onConnect}
                        onDisconnect={onDisconnect}
                        onNewFolder={() => setNewFolderDialogOpen(!newFolderDialogOpen)}
                        onRemoveSelected={() => removeSelected()}
                        onAddFile={() => addFile()}
                    />
                </Paper>
                <Paper style={{
                    flexBasis: 0,
                    flexGrow: 1,
                    padding: "10px",
                }}>
                    <BrowserWindow
                        path={path}
                        fileStore={fileStore}
                        onOpen={onOpen}
                        onPathChange={onPathChange}
                        onNav={onNav}
                        onSelect={onSelect}
                    />
                </Paper>
            </Grid>
        </Box>
    );
}