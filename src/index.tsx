import React from "react";
import ReactDOM from "react-dom";
// import "minireset.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "tachyons/css/tachyons.min.css";
import "./global.scss";

ReactDOM.render(<App />, document.getElementById("root"));

// if you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
