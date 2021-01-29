import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Loading.css";
import Waiting from "./Waiting.js";

class Loading extends Component {
  render() {
    return (
      <div>
        <head>
          <meta charset="utf-8" />
          <title>Gameboard – 11</title>

          {/* <link rel="stylesheet" href="gameboard11.css"> */}
        </head>

        <body>
          <div
            data-layer="3e0b8fb5-859d-4c95-8cb4-044e91eb57e4"
            className="gameboard11"
          >
            {" "}
            <div
              data-layer="01db2dcf-c94e-4b11-903f-91e3bddaca3f"
              className="rectangle11"
            ></div>
            <svg
              data-layer="55137398-a528-45f1-8a38-8f5bf94f36af"
              preserveAspectRatio="none"
              viewBox="-0.75 -0.75 1921.5 1081.5"
              className="path1102"
            >
              <path d="M 0 0 L 1920 0 L 1920 1080 L 0 1080 L 0 0 Z" />
            </svg>
            <div
              data-layer="f972c72a-91ff-43e2-81b3-1360111a7888"
              className="x25694"
            ></div>
            <div
              data-layer="26d61f23-4da0-4865-9969-e188c2eafe98"
              className="component5320"
            ></div>
            <div
              data-layer="2c71a173-c048-4b0a-8abf-a5b18cd1706e"
              className="img3253"
            ></div>
            <div
              data-layer="c98b7c49-b882-42da-be25-1392fda0aed8"
              className="group1545"
            ></div>
            <Waiting/>
            {// This is the changing component
            /* 
                if waiting then <Waiting />
                if rolling dice then <Roll />
                if "You got" then <RollResult />
                if order then <Order />
            */
            /* <div
              data-layer="a92df4c1-1bb3-4349-bb7f-a67ccb7f97a6"
              className="order"
            ></div> */}
          </div>
        </body>
      </div>
    );
  }
}

export default Loading;