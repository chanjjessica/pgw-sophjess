import React, { Component } from "react";
import { Link } from "react-router-dom";
// import { Button } from 'react-bootstrap';
import "./Welcome.css";

class Welcome extends Component {
  render() {
    return (
      <div>
        <head>
          <meta charset="utf-8" />
          <title>Web 1920 – 12</title>

          <link rel="stylesheet" href="web192012.css" />
        </head>

        <body>
          <div
            data-layer="1fd0f7b6-561a-4ea6-a427-4ebed187a2b0"
            className="web192012"
          >
            <div
              data-layer="6f1d7962-efa7-4b1d-af88-0da6c804059e"
              className="homescreen4"
            ></div>
            <div
              data-layer="17180e76-d88e-44f9-9124-1af63577eca9"
              className="rectangle11"
            ></div>
            <div
              data-layer="f68a10ed-7de7-445a-9210-ddd2d77f3982"
              className="group1527"
            ></div>
            <div
              data-layer="9916eb17-0e7a-48f6-90e9-e45afdbc5c37"
              className="playGameworksLtdCopyright2020"
            >
              Play Gameworks Ltd. Copyright 2020
            </div>
            <div
              data-layer="ba953210-1095-4d2e-9a34-d92ea75337df"
              className="rectangle19"
            ></div>
            <div
              data-layer="9321d425-fa7b-4054-9e56-f7234bae88d2"
              className="x1600349927843"
            ></div>
            <Link
              to="/login"
              data-layer="edfca9e8-2336-4a08-9e2f-368ca2e2cc7b"
              className="component162"
            >
              <div
                to="/login"
                data-layer="c2ce21b0-b57f-44af-bdea-4a2a6e24215e"
                className="login"
              >
                Login
              </div>
              <div
                data-layer="bf012c1e-3774-48bb-acf9-2bf88a784a49"
                className="rectangle20"
              ></div>
            </Link>
            <Link
              to="/register"
              data-layer="903ffd7c-ad0d-49f4-9e22-87e7a130b9f2"
              className="component172"
            >
              <div
                data-layer="3cca26e6-3ef2-48ea-aaf6-445c86c4bbbc"
                className="signUp"
              >
                Sign up
              </div>
              <div
                data-layer="6b2fad6e-3f31-4739-a3fc-ebb78a85ca7a"
                className="rectangle21"
              ></div>
            </Link>
            <div
              data-layer="65797876-5100-4852-9952-b899bb30f184"
              className="img3256"
            ></div>
          </div>
        </body>
      </div>
    );
  }
}

export default Welcome;
