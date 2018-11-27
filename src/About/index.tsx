import React, { Component } from "react";
import { Link } from "react-router-dom";
import portrait from "./me.jpg";

class App extends Component {
  render(): React.ReactNode {
    return (
      <>
        <header className="mw8 center ph2" role="banner">
          <div className="fl-ns w-third-ns ph2">
            <img className="br-100" alt="" src={portrait} />
          </div>
          <div className="fl-ns w-two-thirds-ns ph2 pt3-ns pt4-s">
            <h1 className="lh-title">Liam Dawson</h1>
            <p className="lh-title">
              A Melbourne-based cross-functional developer.
            </p>
            <p>
              <em>
                The presence of Liam is often heralded by bad jokes (generally
                puns), and the usage of the phrase "What could possibly go
                wrong?"
              </em>
            </p>
          </div>
        </header>
        <section className="cb mw8 pa4 center">
          <header>
            <h2>Notable Destinations</h2>
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
              <Link to="/adventures/printing">3D printing (mis)adventures</Link>
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
                    Keybase: liamdawson{" "}
                    <small>(including public PGP key)</small>
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
