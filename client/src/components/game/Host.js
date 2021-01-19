import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Host.css";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:5000/";

let socket = socketIOClient(ENDPOINT);

class Host extends Component {

  createRoom() {
    var form = document.createElement('form');
    form.setAttribute('method', 'get');
    console.log("hey");
    socket.emit('createRoom','test',(data)=>{
      console.log(socket.id.toString() + ' created a room ' + data.toString())
      form.setAttribute('action', '/game_'+data.toString());
      form.style.display = 'hidden';
      document.body.appendChild(form)
      form.submit();
    });
  }

  render() {
    return (
      <div>
        <head>
          <meta charset="utf-8" />
          <title>Host Game- OG – 1</title>

          {/* <link rel="stylesheet" href="hostGameOg1.css"> */}
        </head>

        <body>
          <div
            data-layer="7080a1d7-25ac-4fc4-8673-113dc6f74cc8"
            className="hostGameOg1"
          >
            {" "}
            <div
              data-layer="222abe3e-0f46-45c0-bbb6-927dfc48ff20"
              className="homescreen4"
            ></div>
            <div
              data-layer="bdb6ed39-95c2-45d9-9cd0-fcb495b1b15f"
              className="rectangle11"
            ></div>
            <div
              data-layer="c73ebfc8-51d4-4e8c-8c15-1e13522c01f7"
              className="group18"
            >
              {" "}
              <div
                data-layer="0b25f27a-2ddb-4b4d-83ef-2a92cf4cf603"
                className="playGameworksLtdCopyright20202000ba4c"
              >
                Play Gameworks Ltd. Copyright 2020
              </div>
              <div
                data-layer="f056d5bb-7758-4ca7-ae6a-91bb7114302f"
                className="group1522"
              >
                {" "}
                <div
                  data-layer="5fdcada2-bd8a-4301-99b3-ff4b58f2e959"
                  className="playGameworksLtdCopyright2020"
                >
                  Play Gameworks Ltd. Copyright 2020
                </div>
                <div
                  data-layer="17a5df8c-170b-460b-bd97-aafceddbe125"
                  className="rectangle1635"
                ></div>
              </div>
            </div>
            <div
              data-layer="0b41fc3d-05d9-4ee1-baf3-a07e6b27983e"
              className="openGames"
            >
              Open Games
            </div>
            <div
              data-layer="1a4269a5-aa74-495f-9cfc-63d80183b75a"
              className="x25694"
            >
              {" "}
              <div
                data-layer="b2e2cbed-694c-40f4-8c11-39591da32311"
                className="group1"
              >
                {" "}
                <svg
                  data-layer="edc7a817-175a-4c4e-819d-0bc93e56e58b"
                  preserveAspectRatio="none"
                  viewBox="65.69800567626953 120.93900299072266 26.9365234375 23.94408416748047"
                  className="path1"
                >
                  <path d="M 79.16619873046875 120.9390029907227 L 65.72158813476563 132.0226440429688 C 65.72158813476563 132.0382995605469 65.71765899658203 132.0613098144531 65.70980072021484 132.0926818847656 C 65.70210266113281 132.1237945556641 65.69800567626953 132.1464080810547 65.69800567626953 132.1624450683594 L 65.69800567626953 143.3858184814453 C 65.69800567626953 143.7910461425781 65.84616088867188 144.1422271728516 66.14238739013672 144.4379577636719 C 66.43852996826172 144.7338562011719 66.78921508789063 144.8827514648438 67.19452667236328 144.8827514648438 L 76.17298889160156 144.8827514648438 L 76.17298889160156 135.9037933349609 L 82.15947723388672 135.9037933349609 L 82.15947723388672 144.8830871582031 L 91.13786315917969 144.8830871582031 C 91.5430908203125 144.8830871582031 91.89427185058594 144.7345123291016 92.19000244140625 144.4379577636719 C 92.48623657226563 144.1425628662109 92.63487243652344 143.7911376953125 92.63487243652344 143.3858184814453 L 92.63487243652344 132.1624450683594 C 92.63487243652344 132.1002044677734 92.62635803222656 132.0531921386719 92.61128997802734 132.0226440429688 L 79.16619873046875 120.9390029907227 Z" />
                </svg>
                <svg
                  data-layer="5bf47ed8-d9a8-40f8-babb-fe08c3f3abf3"
                  preserveAspectRatio="none"
                  viewBox="-0.000557642662897706 46.99400329589844 37.6982421875 17.656784057617188"
                  className="path2"
                >
                  <path d="M 37.43681335449219 61.60819244384766 L 32.3163948059082 57.35261154174805 L 32.3163948059082 47.81257247924805 C 32.3163948059082 47.59447860717773 32.24629211425781 47.41512298583984 32.1055908203125 47.27474975585938 C 31.96603393554688 47.13454055786133 31.78667831420898 47.06443405151367 31.56809425354004 47.06443405151367 L 27.07877922058105 47.06443405151367 C 26.86044120788574 47.06443405151367 26.6811637878418 47.13454055786133 26.54070854187012 47.27474975585938 C 26.40058135986328 47.41512298583984 26.33055877685547 47.59455871582031 26.33055877685547 47.81257247924805 L 26.33055877685547 52.37207412719727 L 20.62538719177246 47.60193252563477 C 20.12712097167969 47.19661712646484 19.53467178344727 46.99400329589844 18.84869575500488 46.99400329589844 C 18.16279983520508 46.99400329589844 17.57043266296387 47.19661712646484 17.07167434692383 47.60193252563477 L 0.2592681050300598 61.60819244384766 C 0.1034164354205132 61.73267364501953 0.01799693517386913 61.90023803710938 0.002108745276927948 62.1107177734375 C -0.0136975459754467 62.32102966308594 0.04076454415917397 62.50472640991211 0.1656588166952133 62.66049575805664 L 1.615333199501038 64.39083862304688 C 1.740227460861206 64.53104400634766 1.903695702552795 64.61679077148438 2.106393098831177 64.64815521240234 C 2.293529748916626 64.66387939453125 2.480666399002075 64.60917663574219 2.667803287506104 64.48452758789063 L 18.84820556640625 50.99250411987305 L 35.02877044677734 64.48444366455078 C 35.15374755859375 64.59320068359375 35.31713104248047 64.64749908447266 35.51982879638672 64.64749908447266 L 35.5900993347168 64.64749908447266 C 35.7924690246582 64.61670684814453 35.95560836791992 64.53038787841797 36.08115768432617 64.3905029296875 L 37.53099822998047 62.6604118347168 C 37.65564346313477 62.50431442260742 37.71026992797852 62.32094573974609 37.69405364990234 62.11038589477539 C 37.67808532714844 61.90048217773438 37.59233856201172 61.73291778564453 37.43681335449219 61.60819244384766 Z" />
                </svg>
              </div>
            </div>
            <div
              data-layer="cf7059bd-b559-451d-9c22-f049f8075b0d"
              className="component535"
            >
              {" "}
              <svg
                data-layer="92793a45-9538-4fb6-bd20-167618903e84"
                preserveAspectRatio="none"
                viewBox="0 0 34 34"
                className="ellipse1"
              >
                <path d="M 17 0 C 26.38883972167969 0 34 7.611159324645996 34 17 C 34 26.38883972167969 26.38883972167969 34 17 34 C 7.611159324645996 34 0 26.38883972167969 0 17 C 0 7.611159324645996 7.611159324645996 0 17 0 Z" />
              </svg>
              <div
                data-layer="5482ef32-4993-457c-b963-e6aaaf639d34"
                className="x0c3b3adb1a7530892e55ef36d3be6cb8"
              ></div>
            </div>
            <div
              data-layer="b14ab454-76dc-43a9-abaa-6dc500515113"
              className="rectangle1617"
            ></div>
            <div
              data-layer="44aaa328-7b92-4e29-8cf1-831b272bdc31"
              className="hostGame"
            >
              Host Game
            </div>
            <Link to="/dashboard"
              data-layer="ba8cbfa5-aa9f-46d2-b99b-3b28cd727c72"
              className="group1514"
            >
              {" "}
              <svg
                data-layer="25d6ece7-d0aa-4c9c-864b-8d3351936420"
                preserveAspectRatio="none"
                viewBox="-5 -5 51 10"
                className="line204"
              >
                <path d="M 0 0 L 41 0" />
              </svg>
              <svg
                data-layer="c33163f5-2977-4577-8be9-e3f43dd85722"
                preserveAspectRatio="none"
                viewBox="-7.052734375 -7.0531005859375 29.10546875 27.106201171875"
                className="line205"
              >
                <path d="M 0 13 L 15 0" />
              </svg>
              <svg
                data-layer="b82f1c19-2e6a-4d17-9fed-75643a0167a9"
                preserveAspectRatio="none"
                viewBox="-7.052734375 -7.0531005859375 29.10546875 27.106201171875"
                className="line206"
              >
                <path d="M 0 0 L 15 13" />
              </svg>
            </Link>
            <div
              data-layer="da9f2bbe-b4d9-4510-b835-77d87fc3c52f"
              className="joinGame"
            >
              Join Game
            </div>
            <div
              data-layer="fb483ed1-b9b1-4c2b-b3ad-d4405d82a32a"
              className="component7035"
            >
              {" "}
              <div
                data-layer="1f66bf6a-4578-459c-bd5d-08756d56289a"
                className="group1517"
              >
                {" "}
                <div
                  data-layer="4d1a6843-da73-4f8d-b15c-5a506345615b"
                  className="rectangle1630"
                ></div>
                <div
                  data-layer="dec630bf-60fb-4b2c-b532-af4d51940bce"
                  className="privateGame"
                >
                  Private Game
                </div>
                <div
                  data-layer="9ee614b2-aa92-431e-877d-489a306f8c34"
                  className="hostAGameWithYourFriendsBySharingAnAccessCode"
                >
                  host a game with your friends by sharing an access code
                </div>
              </div>
              <div
                data-layer="cbe2642f-eb4d-4af4-bdda-57ba844f7abd"
                className="rectangle1633"
              ></div>
            </div>
            <div
              data-layer="47634e86-d331-4975-ad51-533ca61a0b81"
              className="component7025"
              onClick={this.createRoom}
            >
              {" "}
              <div
                data-layer="82753a23-0e26-4efa-a6c7-cc78d0290fc2"
                className="group1516"
              >
                {" "}
                <div
                  data-layer="79586ecc-d556-48f7-9861-db85891812ce"
                  className="rectangle1629"
                ></div>
                <div
                  data-layer="99fe10e8-1b78-484d-b316-92df1ce2aeb8"
                  className="publicGame"
                >
                  Public Game
                </div>
                <div
                  data-layer="d849b244-b155-446d-a3a1-5326ae9fc758"
                  className="hostAGameThatAnyoneCanJoinInOpenGames"
                >
                  host a game that anyone can join in “Open Games”
                </div>
              </div>
              <div
                data-layer="9874caa2-8e36-4c32-80fd-b8417b2307e3"
                className="rectangle1632"
              ></div>
            </div>
            <div
              data-layer="680ecd25-5ee4-49b0-9bb3-23eadca92181"
              className="playmahjongLogoCopy"
            ></div>
            <div
              data-layer="715d3693-95aa-4eb5-879b-fd51e6b17ae2"
              className="group1537"
            >
              {" "}
              <div
                data-layer="c035d102-9e97-4856-bc2c-31dc70285a06"
                className="rectangle1631"
              ></div>
              <div
                data-layer="fc1661d7-123f-4adf-827a-f1fbfab35a37"
                className="startGame"
              >
                Start Game
              </div>
            </div>
            <div
              data-layer="aa5ae7c0-c077-4c07-8c06-e3a3b24e9384"
              className="img3253"
            ></div>
          </div>
        </body>
      </div>
    );
  }
}

export default Host;