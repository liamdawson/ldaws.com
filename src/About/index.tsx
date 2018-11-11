import React, { Component } from "react";
import { Link } from "react-router-dom";
import portrait from "./portrait.png";
import "./About.scss";

class App extends Component {
  render(): React.ReactNode {
    return (
      <>
        <header className="authorHeader" role="banner">
          <img className="authorHeader-portrait" alt="" src={portrait} />
          <h1>Liam Dawson</h1>
          <p>A Melbourne-based cross-functional developer.</p>
          <p>
            <em>
              The presence of Liam is often heralded by bad jokes (generally
              puns), and the usage of the phrase "What could possibly go wrong?"
            </em>
          </p>
        </header>
        <section className="textSection">
          <header>
            <h2>"Temporary" directory</h2>
          </header>
          <ul>
            <li>
              <a href="https://medium.com/@liamdawson">
                Infrequent writings/talks
              </a>
            </li>
            <li>
              <a href="https://boardgamegeek.com/collection/user/jesterfraud?own=1&amp;subtype=boardgame&amp;ff=1">
                Board game collection
              </a>
            </li>
            <li>
              <Link to="/adventures/printing">
                3D printing (mis)adventures
              </Link>
            </li>
            <li>
              <a href="https://www.instagram.com/phoebe.consuela/">My cat</a>
            </li>
            <li>
              Social media
              <ul>
                <li>
                  <a href="mailto:liam@ldaws.com">Email: liam@ldaws.com</a>
                </li>
                <li>
                  <a href="https://twitter.com/liamdaws">Twitter: liamdaws</a>
                </li>
                <li>
                  <a href="https://linkedin.com/in/liamdawson1">LinkedIn</a>
                </li>
                <li>
                  <a href="https://github.com/liamdawson">GitHub: liamdawson</a>
                </li>
                <li>
                  <a href="https://gitlab.com/liamdawson">GitLab: liamdawson</a>
                </li>
                <li>
                  <a href="https://dribbble.com/liamdawson">
                    Dribbble: liamdawson
                  </a>
                </li>
                <li>
                  <a href="https://stackoverflow.com/users/201487">
                    StackOverflow
                  </a>
                </li>
                <li>
                  <a href="https://keybase.io/liamdawson">
                    Keybase: liamdawson <small>(including public PGP key)</small>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </section>
      </>
    );
  }
}

export default App;
