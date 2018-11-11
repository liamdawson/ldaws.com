import React, { Component } from "react";

class App extends Component {
  render(): React.ReactNode {
    return (
      <>
        <header className="authorHeader" role="banner">
          <h1>3D Printing</h1>
          <p>Various (mis)adventures in printing things in plastic.</p>
        </header>
        <section className="textSection">
          <header>
            <h2>Coming soon!</h2>
          </header>
        </section>
      </>
    );
  }
}

export default App;
