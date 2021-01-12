import React, { Component } from "react";
import { Link } from "react-router-dom";
// import { Button } from 'react-bootstrap';
import "./Welcome.css"

class Welcome extends Component {
    render() {
        return(
<div>
    <head>
        <meta charset="utf-8"/>
        <title>Web 1920 – 11</title>
        
        {/* <link rel="stylesheet" href="web192011.css"/> */}
    </head> 
​
    <body>
        <div data-layer="cb5e68ae-2a75-4c89-ab44-9b833016b841" className="web192011">        <div data-layer="2b79d6fa-f987-4908-ba55-549cb5699ec5" className="homescreen4"></div>
        <div data-layer="e78c8d2b-3488-4e23-97cf-853c11aac0a4" className="rectangle11"></div>
        <div data-layer="37387328-2cd9-4065-8179-91d881acddf2" className="playGameworksLtdCopyright2020">Play Gameworks Ltd. Copyright 2020</div>
        <div data-layer="e6c0f44e-6442-4d6d-9748-6b4e5796f12b" className="rectangle19"></div>
        <div data-layer="5cff7b58-b974-413f-8350-af48ca0ccf1e" className="x1600349927843"></div>
        <div data-layer="35994f84-efb4-456a-b256-417641076524" className="playmahjong"></div>
        
        <Link to="/login" data-layer="bc9bf4fc-9259-4779-bc3c-ffd185168871" className="btn-flat waves-effect waves-purple no-uppercase component161">      
    
            <div data-layer="edafc455-d8cc-4061-99a4-84b3ffe01335" className="login">Login</div>
            <div data-layer="0de21636-e118-4a3c-8a8d-834558924d54" className="rectangle20"></div>

        </Link>

        <Link to="/register" data-layer="1e22b445-b71f-4c6b-8f7a-55299f0a2b4b" className="btn-flat waves-effect waves-purple no-uppercase component171">            
            <div data-layer="704d23e8-4c16-4936-9299-2c87c5400054" className="signUp">Sign up</div>
            <div data-layer="f75b5661-4edd-42ef-9cb9-ba8582a07b2e" className="rectangle21"></div>
        </Link>
</div>
​
​
    
    </body>
</div>
        );
    }
}

export default Welcome;