import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./GameRoom.css";
import GameRoom from "./GameRoom.js";

class Waiting extends Component {
    render() {
        return (
            <div>
                <body>
                    <div data-layer="29fe2070-d3a5-487f-aac1-0bcc01771d7e" className="x010">
                        0:10
                    </div>
                    <div
                        data-layer="b5ef03ba-5d48-4c2b-b693-c46229b5d650"
                        className="waiting"
                    >
                        WAITING. . .
                    </div>
                    <GameRoom />
                </body>
            </div>
        );
    }
}

export default Waiting;