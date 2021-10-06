import React from "react";
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import "./App.css";
import NavBar from "./NavBar";
import DomainConnectMenu from "./DomainConnectMenu";
import FileGrid from "./FileGrid";
import Socket from "./Socket";

export default function App() {
    return (
        <Router>
            <NavBar/>

            <Link className={"icon-root"} to="/socket">Socket</Link>

            <Switch>

                <Route path="/socket">
                    <Socket/>
                </Route>

                <Route path="/domain/:test">
                    <FileGrid/>
                </Route>

                <Route path="/">
                    <DomainConnectMenu defaultValue={"demo"}/>
                </Route>
            </Switch>
        </Router>
    );
}
