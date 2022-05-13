import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Principal } from "@dfinity/principal";

const CURRENT_USER_ID = Principal.fromText(process.env.CURRENT_USER_ID);
export default CURRENT_USER_ID;

const init = async () => {
  ReactDOM.render(<App />, document.getElementById("root"));
};

init();
