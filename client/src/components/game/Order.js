import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Order.css";
import "./Loading.css";
import GameRoom from "./Loading.js";

class Order extends Component {
  render() {
    return (
      <div
        data-layer="6e2b4d0c-b6e3-4231-a94b-dc2d52cc7280"
        class="order22d5a51e"
      >
        {" "}
        <div
          data-layer="b1531304-843d-43b4-a9bf-97b6a7851372"
          class="rectangle1657"
        ></div>
        <div
          data-layer="2b5b5278-b66d-410f-aa5c-e898de969fef"
          class="playGameworksLogo"
        ></div>
        <div data-layer="b2e9eb5e-dd77-46bc-847f-b2f372d69b1b" class="x010">
          0:10
        </div>
        <div data-layer="3892fec7-1359-4e66-aacb-83d352e24f32" class="order">
          ORDER
        </div>
        <div data-layer="23076793-19fc-41c9-9cda-0ac5a970aeaf" class="player1">
          PLAYER 1
        </div>
        <div data-layer="b163b20d-34d4-4f33-81d3-83faad69dc64" class="player2">
          PLAYER 2
        </div>
        <div data-layer="fd6aac6b-3fc9-4743-be30-ea2dc160d013" class="player3">
          PLAYER 3
        </div>
        <div data-layer="3ff88d8a-064a-4f70-ace1-5ae1de7bc0a2" class="player4">
          PLAYER 4
        </div>
      </div>
    );
  }
}

export default Order;