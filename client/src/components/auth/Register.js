import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import GoogleBtn from "./GoogleBtn";

class Register extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      password2: "",
      agree:false,
      errors: {},
    };
  }

  onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
    this.setState({
        agree: e.target.checked
       });
  };

  onSubmit = (e) => {
    e.preventDefault();
    // const newUser = {
    //   email: this.state.email,
    //   password: this.state.password,
    //   password2: this.state.password2,
    //   agree: this.state.agree
    // };
    // console.log(newUser);
    console.log("Sign-up-form, email: ");
    console.log(this.state.email);
    axios.post("/users/", {
      email: this.state.email,
      password: this.state.password
    })
    .then(response => {
      console.log(response)
      if (response.data) {
        console.log("Successful signup");
        this.setState({
          redirectTo: "/login"
        })
      }
      else {
        console.log("Sign-up error");
      }

    })
    .catch(error => {
      console.log("Sign up server error: ");
      console.log(error);
    })
  };

  render() {
    const { errors } = this.state;

    return (
      <div>
        <head>
          <meta charset="utf-8" />
          <title>Web 1920 – 2</title>

          {/* <link rel="stylesheet" href="web19202.css" /> */}
        </head>
        ​
        <body>
          <div
            data-layer="fb16e123-3bbb-41a9-b74e-99ff0b5b44ca"
            className="web19202"
          >
            {" "}
            <div
              data-layer="d78ac75a-fb1f-413e-8097-c30811a4fabb"
              className="homescreen4"
            ></div>
            <div
              data-layer="de2a272f-18a6-411f-a8af-29faadeeccdb"
              className="x1600349322906"
            ></div>
            <div
              data-layer="37acfc07-0fd0-4666-b0a8-4fdb3af4a1c5"
              className="x25694"
            >
              {" "}
              <div
                data-layer="c6792674-6a5a-4ec1-ba8d-0c0fd35b9da8"
                className="group1"
              >
                {" "}
                <svg
                  data-layer="1afb090c-d2d9-46f1-9b95-f21321536a27"
                  preserveAspectRatio="none"
                  viewBox="65.69800567626953 120.93900299072266 26.9365234375 23.94408416748047"
                  className="path1"
                >
                  <path d="M 79.16619873046875 120.9390029907227 L 65.72158813476562 132.0226440429688 C 65.72158813476562 132.0382995605469 65.71765899658203 132.0613098144531 65.70980072021484 132.0926818847656 C 65.70210266113281 132.1237945556641 65.69800567626953 132.1464080810547 65.69800567626953 132.1624450683594 L 65.69800567626953 143.3858184814453 C 65.69800567626953 143.7910461425781 65.84616088867188 144.1422271728516 66.14238739013672 144.4379577636719 C 66.43852996826172 144.7338562011719 66.78921508789062 144.8827514648438 67.19452667236328 144.8827514648438 L 76.17298889160156 144.8827514648438 L 76.17298889160156 135.9037933349609 L 82.15947723388672 135.9037933349609 L 82.15947723388672 144.8830871582031 L 91.13786315917969 144.8830871582031 C 91.5430908203125 144.8830871582031 91.89427185058594 144.7345123291016 92.19000244140625 144.4379577636719 C 92.48623657226562 144.1425628662109 92.63487243652344 143.7911376953125 92.63487243652344 143.3858184814453 L 92.63487243652344 132.1624450683594 C 92.63487243652344 132.1002044677734 92.62635803222656 132.0531921386719 92.61128997802734 132.0226440429688 L 79.16619873046875 120.9390029907227 Z" />
                </svg>
                <svg
                  data-layer="cde24727-3284-49b3-809b-4f16ada91caa"
                  preserveAspectRatio="none"
                  viewBox="-0.000557642662897706 46.99400329589844 37.697265625 17.656784057617188"
                  className="path2"
                >
                  <path d="M 37.43681335449219 61.60819244384766 L 32.3163948059082 57.35261154174805 L 32.3163948059082 47.81257247924805 C 32.3163948059082 47.59447860717773 32.24629211425781 47.41512298583984 32.1055908203125 47.27474975585938 C 31.96603393554688 47.13454055786133 31.78667831420898 47.06443405151367 31.56809425354004 47.06443405151367 L 27.07877922058105 47.06443405151367 C 26.86044120788574 47.06443405151367 26.6811637878418 47.13454055786133 26.54070854187012 47.27474975585938 C 26.40058135986328 47.41512298583984 26.33055877685547 47.59455871582031 26.33055877685547 47.81257247924805 L 26.33055877685547 52.37207412719727 L 20.62538719177246 47.60193252563477 C 20.12712097167969 47.19661712646484 19.53467178344727 46.99400329589844 18.84869575500488 46.99400329589844 C 18.16279983520508 46.99400329589844 17.57043266296387 47.19661712646484 17.07167434692383 47.60193252563477 L 0.2592681050300598 61.60819244384766 C 0.1034164354205132 61.73267364501953 0.01799693517386913 61.90023803710938 0.002108745276927948 62.1107177734375 C -0.0136975459754467 62.32102966308594 0.04076454415917397 62.50472640991211 0.1656588166952133 62.66049575805664 L 1.615333199501038 64.39083862304688 C 1.740227460861206 64.53104400634766 1.903695702552795 64.61679077148438 2.106393098831177 64.64815521240234 C 2.293529748916626 64.66387939453125 2.480666399002075 64.60917663574219 2.667803287506104 64.48452758789062 L 18.84820556640625 50.99250411987305 L 35.02877044677734 64.48444366455078 C 35.15374755859375 64.59320068359375 35.31713104248047 64.64749908447266 35.51982879638672 64.64749908447266 L 35.5900993347168 64.64749908447266 C 35.7924690246582 64.61670684814453 35.95560836791992 64.53038787841797 36.08115768432617 64.3905029296875 L 37.53099822998047 62.6604118347168 C 37.65564346313477 62.50431442260742 37.71026992797852 62.32094573974609 37.69405364990234 62.11038589477539 C 37.67808532714844 61.90048217773438 37.59233856201172 61.73291778564453 37.43681335449219 61.60819244384766 Z" />
                </svg>
              </div>
            </div>
            <div
              data-layer="03028ea8-68f9-4a2b-96cf-a5bb8bf0a0e4"
              className="rectangle1"
            ></div>
            <div
              data-layer="111e0808-1899-4615-aea2-52e6fb215422"
              className="signUp"
            >
              Sign Up
            </div>
            <div
              data-layer="498e8f54-4089-4a3a-80d0-6ed0464bc7e2"
              className="logIn"
            >
              Log In
            </div>
            <form onSubmit={this.onSubmit}>
            <div
              data-layer="25f6fb1d-092a-45e3-95ec-117fabd9a3b3"
              className="group2"
            >
              {" "}
              <button
                data-layer="48198d4c-444f-4cd4-b40e-103c76ce1881"
                className="btn-flat no-uppercase rectangle4"
                type="submit"
              >Create Account</button>
              {/* <div
                data-layer="bb0b4fb9-6756-445d-b7b5-f00305064872"
                className="createAccount"
              >
                Create Account
              </div> */}
            </div>
            <div
              data-layer="feacb39a-0dcb-4e97-a2b3-b9f822e524f0"
              className="x124010"
            ><GoogleBtn/></div>
            <div
              data-layer="9d4c59d7-247d-4bc8-b565-2bedb8bc685c"
              className="googleLogin0"
            ></div>
            <div
              data-layer="65a8d802-2bb4-45e7-aa03-fbd720d8d47f"
              className="x151763360658368674twitterIconSquareLogoPreviewhi"
            ></div>
            <Link
            to="/login"
              data-layer="67871f09-ab00-45b8-a11f-4fa146596eb4"
              className="rectangle6"
            ></Link>
            <div
              data-layer="189b061c-5c48-45d3-83d6-cc8149ec97cb"
              className="rectangle8"
            ></div>
            <div
              data-layer="fff7e7c9-78ca-474d-907f-f26ce2f0426f"
              className="rectangle9"
            ></div>
            <div
              data-layer="fee0af51-4f71-4489-b0c9-aa54b3511e37"
              className="rectangle10"
            ></div>
            <svg
              data-layer="f043235d-c51b-4028-ac10-6557e8ab4f39"
              preserveAspectRatio="none"
              viewBox="957.7770385742188 325.99920654296875 40.02490234375 29.04986572265625"
              className="path3"
            >
              <path d="M 996.3583984375 345.8014831542969 C 996.076904296875 346.5369873046875 995.3443603515625 348.5706481933594 994.767578125 351.0370178222656 C 994.350341796875 352.8209228515625 994.0848388671875 355.049072265625 994.0848388671875 355.049072265625 L 981.7506103515625 348.0428161621094 L 969.8538818359375 335.3536987304688 L 960.660888671875 329.2201538085938 L 957.7770385742188 325.9992065429688 L 972.84326171875 325.9992065429688 L 991.0189208984375 326.007080078125 L 996.3583984375 334.1609497070312 L 997.802001953125 339.9494934082031 C 997.802001953125 339.9494934082031 996.91357421875 344.3507995605469 996.3583984375 345.8014831542969 Z" />
            </svg>
            <svg
              data-layer="e16d6816-5240-420f-8b23-304a8e37c9e7"
              preserveAspectRatio="none"
              viewBox="0 -0.5 29 1"
              className="line1"
            >
              <path d="M 0 0 L 29 0" />
            </svg>
            
            <div
              data-layer="865a94d3-f4ce-4978-aa36-f70f2c052a27"
              className="group5"
            >
              {" "}
              <input
              // Email address
                data-layer="a4e96db4-2264-4bd4-9f97-1d9da0bf7668"
                className="rectangle2"
                onChange={this.onChange}
                value={this.state.email}
                error={errors.email}
                id="email"
                type="email"
                placeholder="Email address"
              />
              {/* <div
                data-layer="bc238b02-5f9c-4106-b56e-234e7eb28e88"
                className="emailAddress"
              >
                Email address
              </div> */}
            </div>
            <div
              data-layer="d3cd8e2e-162d-4117-985f-1b9a3e74aca4"
              className="group4"
            >
              {" "}
              <input
                data-layer="0bd38850-aafc-49bd-ba9b-e669b1bf7df5"
                className="rectangle3b4231bac"
                onChange={this.onChange}
                value={this.state.password}
                error={errors.password}
                id="password"
                type="password"
                placeholder="Password"
              />
              {/* <div
                data-layer="37114379-8870-4662-a18f-a5211a854617"
                className="password"
              >
                Password
              </div> */}
            </div>
            <div
              data-layer="5cd60a07-782b-4793-a1c4-41be03164f56"
              className="rectangle11"
            ></div>
            <div
              data-layer="903aa711-37b8-4064-a83d-cefd6487253a"
              className="playGameworksLtdCopyright2020"
            >
              Play Gameworks Ltd. Copyright 2020
            </div>
            <div
              data-layer="5d434f3e-b51a-45f2-8eab-a45f1fa18eb2"
              className="component115"
            >
              {" "}
              <svg
                data-layer="9e7b9bc8-0e63-4945-9862-0db3b0ee869e"
                preserveAspectRatio="none"
                viewBox="0 0 34 34"
                className="ellipse1"
              >
                <path d="M 17 0 C 26.38883972167969 0 34 7.611159324645996 34 17 C 34 26.38883972167969 26.38883972167969 34 17 34 C 7.611159324645996 34 0 26.38883972167969 0 17 C 0 7.611159324645996 7.611159324645996 0 17 0 Z" />
              </svg>
              <div
                data-layer="59e28bfc-c14c-4376-b3d7-9a1a7fa18bad"
                className="x0c3b3adb1a7530892e55ef36d3be6cb8"
              ></div>
            </div>
            <div
              data-layer="46331115-8c8f-41c3-b59d-9b1eb763d775"
              className="playmahjong"
            ></div>
            <div
              data-layer="fd38bae2-1495-44fc-907e-0c3e038d9846"
              className="group13"
            >
              {" "}
              <input
                data-layer="73d59c3f-814e-4639-8104-8a843a33c97f"
                className="rectangle3"
                onChange={this.onChange}
                value={this.state.password2}
                error={errors.password2}
                id="password2"
                type="password"
                placeholder="Re-enter password"
              />
              {/* <div
                data-layer="0b44ae73-175d-4edc-bec2-5de9d2001542"
                className="reEnterPassword"
              >
                Re-enter password
              </div> */}
            </div>
            <div
              data-layer="65054343-933f-4279-854e-4380b78fb11c"
              className="group14"
            >
              {" "}
              <div>
              <input
              id = "checker"
              type="checkbox"
                data-layer="e6336935-5d4c-4a7f-b2cd-30a0cf39a3f1"
                className="rectangle5"
                checked= {this.state.agree}
                onChange={this.onChange}
              />
              <label htmlFor="checker">asd</label>
              </div>
              <div
                data-layer="71c9ba9f-bcf7-45ab-9046-9e6d81077b28"
                className="pleaseAgreeWithOurTermsAndConditions"
              >
                <span className="pleaseAgreeWithOurTermsAndConditions-0">
                  Please agree with our{" "}
                </span>
                <span className="pleaseAgreeWithOurTermsAndConditions-22">
                  Terms and Conditions
                </span>
              </div>
            </div>
            </form>
            <div
              data-layer="66be7e90-b6c6-4290-b1b4-4b22c3e1e810"
              className="alreadyHaveAnAccountSignIn"
            >
              <span className="alreadyHaveAnAccountSignIn-0">
                Already have an account?{" "}
              </span>
              <Link to="/login">
              <span className="alreadyHaveAnAccountSignIn-25">Sign-in</span>
              </Link>
            </div>
            <div
              data-layer="a2e90aa5-bcb2-4dc5-8d3b-ac3fb5d8db93"
              className="rectangle7"
            ></div>
            <svg
              data-layer="b9a57429-11fd-4b3e-b5d6-5065c66e7104"
              preserveAspectRatio="none"
              viewBox="947.4942626953125 382.6011962890625 11.9765625 34.308197021484375"
              className="path4"
            >
              <path d="M 951.1875610351562 382.6011962890625 L 951.080078125 388.30908203125 L 950.9586791992188 390.7235717773438 L 949.9590454101562 400.5042419433594 L 947.4942626953125 416.4712524414062 L 955.368408203125 416.9093933105469 L 959.4707641601562 407.7283325195312 L 958.492919921875 392.4442443847656 L 954.2976684570312 383.4452819824219 L 951.1875610351562 382.6011962890625 Z" />
            </svg>
            <svg
              data-layer="bffd2e71-1ac4-4be3-a25a-fb1dc93ca040"
              preserveAspectRatio="none"
              viewBox="0 -0.5 33 1"
              className="line5"
            >
              <path d="M 0 0 L 33 0" />
            </svg>
          </div>
          ​ ​
        </body>
      </div>
    );
  }
}

export default Register;
