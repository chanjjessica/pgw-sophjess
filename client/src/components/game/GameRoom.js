import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./GameRoom.css";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:5000/";

let socket = socketIOClient(ENDPOINT);

class GameRoom extends Component {
  //   constructor() {
  //       super();
  //       this.state = {
  //         // private:false
  //       };
  //       // this.onChange = this.onChange.bind(this);
  //     }

  // rollDice () {
  //   socket.emit('rollDice', this.player, (data)=>{
  //       console.log("roll");
  //       });
  // }

  render() {
    return (
      <div>
        <head>
          <meta charset="utf-8" />
          <title>Gameboard – 12</title>

          {/* <link rel="stylesheet" href="gameboard12.css"> */}
        </head>

        <body>
          <div
            data-layer="39143d42-d49d-48a0-959b-5669c8985a38"
            className="gameboard12"
          >
            {" "}
            <div
              data-layer="1178ff61-c7a5-48d4-a2b5-7dc252f10068"
              className="rectangle11"
            ></div>
            <div
              data-layer="f9525d47-ebb9-413e-9e49-c873b6f8fd9a"
              className="rectangle1654"
            ></div>
            <div
              data-layer="a8c02713-0637-4bda-82e5-aa86b96720a2"
              className="x25694"
            >
              {" "}
              <div
                data-layer="ea9a1362-abc3-44df-b567-18334a6c650a"
                className="group1"
              >
                {" "}
                <svg
                  data-layer="a7b1486a-1011-420e-92cf-8a93aacebb23"
                  preserveAspectRatio="none"
                  viewBox="65.69800567626953 120.93900299072266 26.9375 23.944091796875"
                  className="path1"
                >
                  <path d="M 79.16619873046875 120.9390029907227 L 65.72158813476563 132.0226440429688 C 65.72158813476563 132.0382995605469 65.71765899658203 132.0613098144531 65.70980072021484 132.0926818847656 C 65.70210266113281 132.1237945556641 65.69800567626953 132.1464080810547 65.69800567626953 132.1624450683594 L 65.69800567626953 143.3858184814453 C 65.69800567626953 143.7910461425781 65.84616088867188 144.1422271728516 66.14238739013672 144.4379577636719 C 66.43852996826172 144.7338562011719 66.78921508789063 144.8827514648438 67.19452667236328 144.8827514648438 L 76.17298889160156 144.8827514648438 L 76.17298889160156 135.9037933349609 L 82.15947723388672 135.9037933349609 L 82.15947723388672 144.8830871582031 L 91.13786315917969 144.8830871582031 C 91.5430908203125 144.8830871582031 91.89427185058594 144.7345123291016 92.19000244140625 144.4379577636719 C 92.48623657226563 144.1425628662109 92.63487243652344 143.7911376953125 92.63487243652344 143.3858184814453 L 92.63487243652344 132.1624450683594 C 92.63487243652344 132.1002044677734 92.62635803222656 132.0531921386719 92.61128997802734 132.0226440429688 L 79.16619873046875 120.9390029907227 Z" />
                </svg>
                <svg
                  data-layer="7552e35b-8552-4954-bdd3-173be2c0205d"
                  preserveAspectRatio="none"
                  viewBox="-0.000557642662897706 46.99400329589844 37.697265625 17.656982421875"
                  className="path2"
                >
                  <path d="M 37.43681335449219 61.60819244384766 L 32.3163948059082 57.35261154174805 L 32.3163948059082 47.81257247924805 C 32.3163948059082 47.59447860717773 32.24629211425781 47.41512298583984 32.1055908203125 47.27474975585938 C 31.96603393554688 47.13454055786133 31.78667831420898 47.06443405151367 31.56809425354004 47.06443405151367 L 27.07877922058105 47.06443405151367 C 26.86044120788574 47.06443405151367 26.6811637878418 47.13454055786133 26.54070854187012 47.27474975585938 C 26.40058135986328 47.41512298583984 26.33055877685547 47.59455871582031 26.33055877685547 47.81257247924805 L 26.33055877685547 52.37207412719727 L 20.62538719177246 47.60193252563477 C 20.12712097167969 47.19661712646484 19.53467178344727 46.99400329589844 18.84869575500488 46.99400329589844 C 18.16279983520508 46.99400329589844 17.57043266296387 47.19661712646484 17.07167434692383 47.60193252563477 L 0.2592681050300598 61.60819244384766 C 0.1034164354205132 61.73267364501953 0.01799693517386913 61.90023803710938 0.002108745276927948 62.1107177734375 C -0.0136975459754467 62.32102966308594 0.04076454415917397 62.50472640991211 0.1656588166952133 62.66049575805664 L 1.615333199501038 64.39083862304688 C 1.740227460861206 64.53104400634766 1.903695702552795 64.61679077148438 2.106393098831177 64.64815521240234 C 2.293529748916626 64.66387939453125 2.480666399002075 64.60917663574219 2.667803287506104 64.48452758789063 L 18.84820556640625 50.99250411987305 L 35.02877044677734 64.48444366455078 C 35.15374755859375 64.59320068359375 35.31713104248047 64.64749908447266 35.51982879638672 64.64749908447266 L 35.5900993347168 64.64749908447266 C 35.7924690246582 64.61670684814453 35.95560836791992 64.53038787841797 36.08115768432617 64.3905029296875 L 37.53099822998047 62.6604118347168 C 37.65564346313477 62.50431442260742 37.71026992797852 62.32094573974609 37.69405364990234 62.11038589477539 C 37.67808532714844 61.90048217773438 37.59233856201172 61.73291778564453 37.43681335449219 61.60819244384766 Z" />
                </svg>
              </div>
            </div>
            <div
              data-layer="d01accde-bcaf-438e-9450-362d9122599a"
              className="component5321"
            >
              {" "}
              <svg
                data-layer="cab4a39c-2284-494d-a72f-0d91bd9fd683"
                preserveAspectRatio="none"
                viewBox="0 0 34 34"
                className="ellipse1"
              >
                <path d="M 17 0 C 26.38883972167969 0 34 7.611159324645996 34 17 C 34 26.38883972167969 26.38883972167969 34 17 34 C 7.611159324645996 34 0 26.38883972167969 0 17 C 0 7.611159324645996 7.611159324645996 0 17 0 Z" />
              </svg>
              <div
                data-layer="743380ef-4fdc-4a7f-a572-d845f1a38cd5"
                className="x0c3b3adb1a7530892e55ef36d3be6cb8"
              ></div>
            </div>
            <div
              data-layer="35a7e28e-584d-4056-ac92-1606a730e1d7"
              className="img3253"
            ></div>
            <div
              data-layer="edc033be-9792-4da8-8df6-133452d33c2e"
              className="group1545"
            >
              {" "}
              <div
                data-layer="75a53dd8-a2fb-42aa-b42c-ecbe136b1b7c"
                className="playGameworksLtdCopyright2020"
              >
                Play Gameworks Ltd. Copyright 2020
              </div>
            </div>
            <div
              data-layer="99e8bbf7-f51c-4b23-a818-22128a6b0965"
              className="rectangle1657"
            ></div>
            <div
              data-layer="095b8d92-3a96-4863-9f5d-5b7431bfff4a"
              className="playGameworksLogo"
            ></div>
            <div
              data-layer="310cdd3a-8681-4448-9ecb-14395d1448f1"
              className="repeatGrid15"
            >
              {" "}
              <div
                data-layer="21c8431c-4c18-4657-8e2b-f066b58a03b4"
                className="rectangle166461825d1f"
              ></div>
              <div
                data-layer="f9e487ae-1a25-48aa-a189-56e8f4148770"
                className="rectangle1664730aaace"
              ></div>
              <div
                data-layer="ccd5675b-7a36-46c6-8422-406d24de866c"
                className="rectangle16643259e4e3"
              ></div>
              <div
                data-layer="5c56a38d-ef72-4d83-9e75-beb90d7bb33a"
                className="rectangle1664607adfc1"
              ></div>
              <div
                data-layer="9cbfa6b8-8b55-49f6-82e1-5d0211486701"
                className="rectangle16645164c34d"
              ></div>
              <div
                data-layer="c516d5e0-06dc-4b1d-9f75-7953621fc407"
                className="rectangle16644c0587a4"
              ></div>
              <div
                data-layer="31a34d59-e97d-496e-9320-48d7d1c6bc23"
                className="rectangle1664fd963aea"
              ></div>
              <div
                data-layer="af28f9e4-8308-4555-9bd7-5eedb38e48de"
                className="rectangle1664cb3505d1"
              ></div>
              <div
                data-layer="32d7034d-64da-40b1-8ec8-74bf43d7f18d"
                className="rectangle1664803b857b"
              ></div>
              <div
                data-layer="7bc47e38-e508-4419-a59f-64e4a04682b6"
                className="rectangle16647dd3d633"
              ></div>
              <div
                data-layer="85b2c656-5c00-4966-a62e-e09c4783c8ef"
                className="rectangle16642a83bc0a"
              ></div>
              <div
                data-layer="2ba4e1f9-b426-4b8b-8cce-35203980fe45"
                className="rectangle166454b2e801"
              ></div>
              <div
                data-layer="20d8c25e-d1c5-4305-b7ea-bf5046065dd2"
                className="rectangle166473a7ea17"
              ></div>
            </div>
            <div
              data-layer="e98ad95a-fbdc-4a1b-a971-9d839089cbae"
              className="repeatGrid17"
            >
              {" "}
              <div
                data-layer="cb5b4868-b4f5-4eb2-a3e9-fe998955dc1a"
                className="rectangle16643e20430d"
              ></div>
              <div
                data-layer="de447482-f04e-4b3e-aada-2497ed4aefa1"
                className="rectangle1664fb4f3d0a"
              ></div>
              <div
                data-layer="b37b60bb-feb9-4a86-857f-3fbe2a59ab88"
                className="rectangle16643f2d0bd4"
              ></div>
              <div
                data-layer="ca7e1440-f65b-4635-96bc-f32393d0d85a"
                className="rectangle16645af78950"
              ></div>
              <div
                data-layer="6b3fc2e5-cbe9-483d-9644-348b316b91fd"
                className="rectangle1664e8b17bf2"
              ></div>
              <div
                data-layer="999b72af-8c60-4676-9ab8-13b4102595f5"
                className="rectangle1664814aa40d"
              ></div>
              <div
                data-layer="667db33e-1b95-4e9e-b6dc-56cc8e1329fe"
                className="rectangle16646f2f017d"
              ></div>
              <div
                data-layer="ea603c18-07a4-41a2-9ab4-f7c89c33c90e"
                className="rectangle16644932d74b"
              ></div>
              <div
                data-layer="0e296da3-9f76-4ee4-9842-c44029edb4c4"
                className="rectangle1664ac7f60b9"
              ></div>
              <div
                data-layer="2be8fa89-e963-4610-9348-0e2a3589ad5d"
                className="rectangle1664c0cf01c2"
              ></div>
              <div
                data-layer="3bfb98b7-b666-4929-af59-4a036bf78506"
                className="rectangle166412a27c0e"
              ></div>
              <div
                data-layer="d3f3c5f7-b965-4a89-b26b-a36c6bfcb1f9"
                className="rectangle1664a02a8ae2"
              ></div>
              <div
                data-layer="0d81a28c-4b2b-41bb-ab69-ef3d07c92639"
                className="rectangle1664b1c4ad51"
              ></div>
            </div>
            <div
              data-layer="b507b618-c676-4bab-958e-fd0b816e7e90"
              className="repeatGrid16"
            >
              {" "}
              <div
                data-layer="3f36bdb0-67aa-41ea-809c-0c5fbcc15e2b"
                className="rectangle1664c7564d30"
              ></div>
              <div
                data-layer="ae4d4c25-2846-4798-ba79-4e39d4935126"
                className="rectangle166425c6b550"
              ></div>
              <div
                data-layer="7c28249e-d597-4877-bb53-9f253185cd10"
                className="rectangle1664a2d2d2f5"
              ></div>
              <div
                data-layer="d323f65c-8987-42d9-a2bc-e60dd8354ab0"
                className="rectangle1664f3d6776e"
              ></div>
              <div
                data-layer="78126a03-bd68-468c-8459-58e71d360ca3"
                className="rectangle1664f25d6d39"
              ></div>
              <div
                data-layer="fc166dcf-2a65-45b2-8ff2-b413cba5598d"
                className="rectangle1664f0f72933"
              ></div>
              <div
                data-layer="5ad4ede4-a61e-42aa-91b3-274df390c3fb"
                className="rectangle16644c12cbde"
              ></div>
              <div
                data-layer="5f33463b-425b-487b-b742-256f6213221b"
                className="rectangle16640d9f52d8"
              ></div>
              <div
                data-layer="d5cf594c-0e12-4a85-b69a-653c23af0c5d"
                className="rectangle1664d1cb55aa"
              ></div>
              <div
                data-layer="1696edca-bf0f-4330-b363-7152bd73d1de"
                className="rectangle166404003823"
              ></div>
              <div
                data-layer="419f6a9d-0fda-4537-b553-2c9a0043eb3e"
                className="rectangle16648d76dc7c"
              ></div>
              <div
                data-layer="9780a873-f810-4734-a366-c6cdab12988b"
                className="rectangle1664a7a34887"
              ></div>
              <div
                data-layer="70a468ac-2814-44b3-b426-4b7403221805"
                className="rectangle1664"
              ></div>
            </div>
            {/* This is the changing component
            <div data-layer="29fe2070-d3a5-487f-aac1-0bcc01771d7e" className="x010">
              0:10
            </div>
            <div
              data-layer="b5ef03ba-5d48-4c2b-b693-c46229b5d650"
              className="waiting"
            >
              WAITING. . .
            </div> */}
            <div
              data-layer="d759d670-65f5-4e51-8dbe-86a38b7b4544"
              className="group1573"
            >
              {" "}
              <div
                data-layer="1559b268-c94d-4021-b915-632634b42229"
                className="rectangle1670"
              ></div>
              <div
                data-layer="22cf1c3a-f5c7-41d8-9d25-61ddebe7edae"
                className="rectangle1671"
              ></div>
            </div>
            <div
              data-layer="9016a0ca-9695-42ed-affc-54847d42bfe5"
              className="group1601"
            >
              {" "}
              <div
                data-layer="b571db44-a5e1-430d-81aa-ed9abf9eb068"
                className="player1You"
              >
                PLAYER 1 (YOU)
              </div>
              <div
                data-layer="1432ea17-37bf-4597-957b-ab24bb57658d"
                className="player3"
              >
                PLAYER 3
              </div>
              <div
                data-layer="20c6cb62-a09e-4387-bb6f-c9fb1f98d424"
                className="player2"
              >
                PLAYER 2
              </div>
              <div
                data-layer="2be1be06-db57-4f6e-9d2b-23067d3cef96"
                className="player4"
              >
                PLAYER 4
              </div>
            </div>
            <div
              data-layer="210415b0-a4f8-4879-bb3b-d99d1b4294ec"
              className="repeatGrid23"
            >
              {" "}
              <div
                data-layer="51ce4f90-2aef-461d-9548-5a397f7f3e00"
                className="rectangle1656910d60d5"
              ></div>
              <div
                data-layer="07fa6d1c-6d60-4e7a-9b01-557d18a39747"
                className="rectangle165676bd39d1"
              ></div>
              <div
                data-layer="46916e6b-d381-45a3-bdcf-cd35e605e1d1"
                className="rectangle1656de58adbb"
              ></div>
              <div
                data-layer="f4d8f32a-81bd-43a5-9263-06400e6d83e2"
                className="rectangle16562e1cfd3c"
              ></div>
              <div
                data-layer="b3438482-fe1b-4de0-87a4-7de648c27a75"
                className="rectangle1656ec1749b9"
              ></div>
              <div
                data-layer="71b7eeb8-5561-4f00-ab36-19bd46c89294"
                className="rectangle165686abd738"
              ></div>
              <div
                data-layer="3dc9d0a0-2fe2-435c-8775-191fe3a60f4b"
                className="rectangle16566e09d352"
              ></div>
              <div
                data-layer="fce5da1f-35be-4499-a25f-7aeaf30f97a0"
                className="rectangle165611a5eb70"
              ></div>
              <div
                data-layer="ef1567ba-d5ba-4b76-b798-cf20e9b46875"
                className="rectangle1656c5727f12"
              ></div>
              <div
                data-layer="30dfde00-cd2a-4807-bac9-33487119b735"
                className="rectangle1656fea5e1c0"
              ></div>
              <div
                data-layer="a44659c7-aeb7-4980-b692-a55da96b1527"
                className="rectangle1656fde6487c"
              ></div>
              <div
                data-layer="cbcb3cd2-b22e-45e2-a65c-3ea2eaa645f4"
                className="rectangle16569fd9d9ba"
              ></div>
              <div
                data-layer="7d600e42-bdfc-422f-9316-73b2c5ee8968"
                className="rectangle1656"
              ></div>
            </div>
          </div>
        </body>
      </div>
    );
  }
}

export default GameRoom;