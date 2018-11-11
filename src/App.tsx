import React, { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import AboutPage from "./About";
import PrintingPage from "./Printing";
import NotFoundPage from "./NotFound";

class App extends Component {
  render(): React.ReactNode {
    return (
      <div className="sans-serif f4 lh-copy">
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={AboutPage} />
            <Route exact path="/adventures/printing/" component={PrintingPage} />
            <Redirect from="/adventures/" to="/" />
            <Route component={NotFoundPage} />
          </Switch>
        </BrowserRouter>
        <footer className="pt4 pb4 tc f5" role="banner">
          <p>
            This page brought to you by many electrons, photons and other tiny
            particles.
          </p>
          <p>Any mistakes were probably my cat sitting on the keyboard.</p>
        </footer>
      </div>
    );
  }
}

export default App;
