import React from "react";
import { Link } from "react-router-dom";

export default () => (
  <>
    <header className="textHeader">
      <h1>Not Found</h1>
      <p>
        <em>Unexpected, this was.</em>
      </p>
    </header>
    <section className="textSection">
      <p>
        The path leads to a dead-end. The page you were seeking is nowhere to be
        found.
      </p>
      <p>What do you do?</p>
      <ol className="lettered">
        <li>
          Bug <a href="https://twitter.com/liamdaws">Liam on Twitter</a> about the missing page
        </li>
        <li>
          <Link to="/">Return to the home page of the site</Link>
        </li>
        <li>
          <a href="https://d3lwos0ph41q19.cloudfront.net/404-a5751ba5a504730bbe4b0aeb619597ccff6386cac7c7dce511e8327720f85701.mp4">
            ????
          </a>
        </li>
        <li>
          <a href="http://srs.business">Profit!</a>
        </li>
      </ol>
    </section>
  </>
);
