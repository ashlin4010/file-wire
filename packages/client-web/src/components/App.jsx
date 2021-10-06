import React from "react";
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import "./App.css";
import NavBar from "./NavBar";
import DomainConnectMenu from "./DomainConnectMenu";
import FileGrid from "./FileGrid";

export default function App() {
    return (
        <Router>
            <NavBar/>

            <Switch>
                <Route path="/domain/:test">
                    <FileGrid/>
                </Route>
                <Route path="/*">
                    <DomainConnectMenu defaultValue={"demo"}/>
                </Route>
            </Switch>
        </Router>
    );
}
