import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Roll.css";
import "./Loading.css";
import GameRoom from "./Loading.js";

class Roll extends Component {
  render() {
    return (
      <div
        data-layer="a0ecb6ea-7d20-4f9b-a9d3-45475dae8f7e"
        className="rollTheDice"
      >
        {" "}
        <div
          data-layer="ef571306-c33e-4c58-961e-e02bd8c6dfba"
          className="rectangle1657"
        ></div>
        <div
          data-layer="d2d3f696-2cd3-4ca4-a7ae-07dff23194db"
          className="rollThedice"
        >
          ROLL THE
          <br />
          DICE
        </div>
        <div
          data-layer="1cea77c2-448b-479f-8b52-cb90bbc3076b"
          className="playGameworksLogo"
        ></div>
        <div data-layer="3e60b717-4d0e-4fc2-a1e7-e2bc6734785b" className="x010">
          0:10
        </div>
        <div
          data-layer="efc02e9d-5354-49f1-bcb2-f4d3d8ff9d66"
          className="dice7cad97be"
        ></div>
        <div
          data-layer="30075650-0a8c-47c1-a68d-d93bae85da57"
          className="dice"
        ></div>
      </div>
    );
  }
}

export default Roll;
