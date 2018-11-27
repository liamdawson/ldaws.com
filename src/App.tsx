import React, { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import AboutPage from "./About";
import PrintingPage from "./Printing";
import NotFoundPage from "./NotFound";
import RecipesPage from "./Recipes";

class App extends Component {
  render(): React.ReactNode {
    return (
      <div className="sans-serif f4 lh-copy w-100">
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={AboutPage} />
            <Route exact path="/adventures/printing/" component={PrintingPage} />
            <Route exact path="/adventures/cooking/" component={RecipesPage} />
            <Redirect from="/adventures/" to="/" />
            <Route component={NotFoundPage} />
          </Switch>
        </BrowserRouter>
        <footer className="pa4 tc f5" role="banner">
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
