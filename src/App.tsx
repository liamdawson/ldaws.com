import React, { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import "./App.scss";
import AboutPage from "./About";
import PrintingPage from "./Printing";
import NotFoundPage from "./NotFound";

class App extends Component {
  render(): React.ReactNode {
    return (
      <>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={AboutPage} />
            <Route exact path="/adventures/printing/" component={PrintingPage} />
            <Redirect from="/adventures/" to="/" />
            <Route component={NotFoundPage} />
          </Switch>
        </BrowserRouter>
        <footer className="pageFooter" role="banner">
          <p>
            This page brought to you by many electrons, photons and other tiny
            particles.
          </p>
          <p>Any mistakes were probably my cat sitting on the keyboard.</p>
        </footer>
      </>
    );
  }
}

export default App;
