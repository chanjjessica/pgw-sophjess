import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import "./Login.css";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            remember:false,
            errors: {},
            redirectTo: null
        };
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

    }

    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
        // if (document.getElementById('checker').checked){
        //     this.state.remember = true;
        //   }
        // else {
        //     this.state.remember = false;
        //   }
        this.setState({
            remember: e.target.checked
           });
    };

    onSubmit = e => {
        e.preventDefault();

        // const userData = {
        //     email: this.state.email,
        //     password: this.state.password
        // };

        // console.log(userData);
        axios
        .post('/users/login', {
            email: this.state.email,
            password: this.state.password
        })
        .then(response => {
            console.log('login response: ')
            console.log(response)
            if (response.status === 200) {
                // update App.js state
                this.props.updateUser({
                    loggedIn: true,
                    email: response.data.email
                })
                // update the state to redirect to home or the dashboard
                this.setState({
                    redirectTo: '/dashboard'
                })
            }
        }).catch(error => {
            console.log('login error: ')
            console.log(error);
            
        })
    };

    render() {
        const { errors } = this.state;
        if (this.state.redirectTo) {
          return <Redirect to={{ pathname: this.state.redirectTo }} />
      }else{

        return (
<div>
          <head>
            <meta charset="utf-8" />
            <title>Web 1920 – 1</title>
        
            {/* <link rel="stylesheet" href="web19201.css" /> */}
          </head>
          ​
          <body>
            <div data-layer="23ef2ffb-fb42-4230-9c9d-447f5ec8d48d" className="web19201">
              <div
                data-layer="227a9548-112c-4a17-adba-ab2f4fd45eaa"
                className="homescreen4"
              ></div>
              <div
                data-layer="6591198c-837e-4828-83a3-e5010e51c75d"
                className="x1600349322906"
              ></div>
              <div data-layer="41f04f20-2e10-42fe-aae6-a515b153e6aa" className="x25694">
                <div data-layer="993cd83b-9c73-4697-932f-6b2eb7ff0093" className="group1">
                  <svg
                    data-layer="738c394b-0c68-4d46-8129-7ef88367c5f8"
                    preserveAspectRatio="none"
                    viewBox="65.69800567626953 120.93900299072266 26.9368896484375 23.94408416748047"
                    className="path1"
                  >
                    <path
                      d="M 79.16619873046875 120.9390029907227 L 65.72158813476562 132.0226440429688 C 65.72158813476562 132.0382995605469 65.71765899658203 132.0613098144531 65.70980072021484 132.0926818847656 C 65.70210266113281 132.1237945556641 65.69800567626953 132.1464080810547 65.69800567626953 132.1624450683594 L 65.69800567626953 143.3858184814453 C 65.69800567626953 143.7910461425781 65.84616088867188 144.1422271728516 66.14238739013672 144.4379577636719 C 66.43852996826172 144.7338562011719 66.78921508789062 144.8827514648438 67.19452667236328 144.8827514648438 L 76.17298889160156 144.8827514648438 L 76.17298889160156 135.9037933349609 L 82.15947723388672 135.9037933349609 L 82.15947723388672 144.8830871582031 L 91.13786315917969 144.8830871582031 C 91.5430908203125 144.8830871582031 91.89427185058594 144.7345123291016 92.19000244140625 144.4379577636719 C 92.48623657226562 144.1425628662109 92.63487243652344 143.7911376953125 92.63487243652344 143.3858184814453 L 92.63487243652344 132.1624450683594 C 92.63487243652344 132.1002044677734 92.62635803222656 132.0531921386719 92.61128997802734 132.0226440429688 L 79.16619873046875 120.9390029907227 Z"
                    />
                  </svg>
                  <svg
                    data-layer="c5d918fc-b400-47fb-b8f3-6e5211cc3da0"
                    preserveAspectRatio="none"
                    viewBox="-0.000557642662897706 46.99400329589844 37.6973876953125 17.656784057617188"
                    className="path2"
                  >
                    <path
                      d="M 37.43681335449219 61.60819244384766 L 32.3163948059082 57.35261154174805 L 32.3163948059082 47.81257247924805 C 32.3163948059082 47.59447860717773 32.24629211425781 47.41512298583984 32.1055908203125 47.27474975585938 C 31.96603393554688 47.13454055786133 31.78667831420898 47.06443405151367 31.56809425354004 47.06443405151367 L 27.07877922058105 47.06443405151367 C 26.86044120788574 47.06443405151367 26.6811637878418 47.13454055786133 26.54070854187012 47.27474975585938 C 26.40058135986328 47.41512298583984 26.33055877685547 47.59455871582031 26.33055877685547 47.81257247924805 L 26.33055877685547 52.37207412719727 L 20.62538719177246 47.60193252563477 C 20.12712097167969 47.19661712646484 19.53467178344727 46.99400329589844 18.84869575500488 46.99400329589844 C 18.16279983520508 46.99400329589844 17.57043266296387 47.19661712646484 17.07167434692383 47.60193252563477 L 0.2592681050300598 61.60819244384766 C 0.1034164354205132 61.73267364501953 0.01799693517386913 61.90023803710938 0.002108745276927948 62.1107177734375 C -0.0136975459754467 62.32102966308594 0.04076454415917397 62.50472640991211 0.1656588166952133 62.66049575805664 L 1.615333199501038 64.39083862304688 C 1.740227460861206 64.53104400634766 1.903695702552795 64.61679077148438 2.106393098831177 64.64815521240234 C 2.293529748916626 64.66387939453125 2.480666399002075 64.60917663574219 2.667803287506104 64.48452758789062 L 18.84820556640625 50.99250411987305 L 35.02877044677734 64.48444366455078 C 35.15374755859375 64.59320068359375 35.31713104248047 64.64749908447266 35.51982879638672 64.64749908447266 L 35.5900993347168 64.64749908447266 C 35.7924690246582 64.61670684814453 35.95560836791992 64.53038787841797 36.08115768432617 64.3905029296875 L 37.53099822998047 62.6604118347168 C 37.65564346313477 62.50431442260742 37.71026992797852 62.32094573974609 37.69405364990234 62.11038589477539 C 37.67808532714844 61.90048217773438 37.59233856201172 61.73291778564453 37.43681335449219 61.60819244384766 Z"
                    />
                  </svg>
                </div>
              </div>
              <form onSubmit={this.onSubmit}>
              <div 
                data-layer="b4969a6b-4413-424e-8b77-769c7d92d127"
                className="rectangle1"
              ></div>
              <div data-layer="800ffc79-a596-4bcf-9a9a-1cea09f479ae" className="signUp">
                Sign Up
              </div>
              <div
                data-layer="ea092716-481a-4a11-acd4-24ca63fbefdf"
                className="logIncc40b51f"
              >
                Log In
              </div>
              <Link
              to="/register"
                data-layer="44ccc677-8950-40e4-a089-47f5c15c593b"
                className="notRegisteredCreateAnAccount"
              >
                Not registered? Create an account
              </Link>
              <div
                data-layer="34df6928-8c92-41f8-9bbb-9304f1ba73c2"
                className="forgotYourEmailpassword"
              >
                Forgot your email/password?
              </div>
              <div data-layer="47e75b8b-080b-411d-a5b0-f5181a7d0ffe" className="group3">
                <div>
                <input
                id="checker"
                type="checkbox"
                  data-layer="61c63bae-1ee8-48e4-a4f2-36e16e3bf88b"
                  className="rectangle5"
                  checked= {this.state.remember}
                  onChange={this.onChange}

                />
                <label htmlFor="checker">asd</label>
                </div>
                <div
                  data-layer="98a4c3fe-b5e4-4600-9703-a0306a2839b1"
                  className="rememberMyInformation"
                >
                  Remember my information
                </div>
              </div>
              <div data-layer="86760612-4f79-4d0e-b30c-b64c9cd97353" className="group2">
                <button
                  data-layer="85b88c3a-6827-4f62-9ed5-3e49e98b42b3"
                  className="btn-flat no-uppercase rectangle4"
                  type="submit"

                >Log in</button>

              </div>
              <div
                data-layer="4a87b93d-5bfc-4b81-8168-85b8ff4e11c3"
                className="x124010"
              ></div>
              <div
                data-layer="3423aedf-c670-4140-be19-f90724067c14"
                className="googleLogin0"
              ></div>
              <div
                data-layer="2fd19008-ca1b-43f8-9965-6482d13820b1"
                className="x151763360658368674twitterIconSquareLogoPreviewhi"
              ></div>
              <div
                data-layer="89f14b5c-aa78-4719-9fd3-49df67a2000e"
                className="rectangle6"
              ></div>
              <div
                data-layer="f35181e3-7c74-4d1a-bba7-5348800b2bba"
                className="rectangle7"
              ></div>
              <div
                data-layer="7725c251-86fc-45c7-bd13-210d1ad5e1be"
                className="rectangle8"
              ></div>
              <Link
                to="/register"
                data-layer="2e91f537-e99a-4d02-98c1-b2650e7b667b"
                className="btn rectangle9"
              ></Link>
              <div
                data-layer="7f33c082-d176-4262-b341-c186ffed4d67"
                className="rectangle10"
              ></div>
              <svg
                data-layer="513ad311-9af3-4dfa-8b92-8ff29ead3672"
                preserveAspectRatio="none"
                viewBox="957.777099609375 325.99920654296875 36.1217041015625 28.446990966796875"
                className="path3"
              >
                <path
                  d="M 959.0799560546875 345.3905334472656 C 959.3339233398438 346.1107788085938 959.9951171875 348.1022338867188 960.5155639648438 350.5173950195312 C 960.8922119140625 352.2642822265625 961.1318359375 354.4461975097656 961.1318359375 354.4461975097656 L 972.26318359375 347.5853576660156 L 982.999755859375 335.1595764160156 L 991.2962036132812 329.1533203125 L 993.8988037109375 325.9992065429688 L 980.3018798828125 325.9992065429688 L 963.8987426757812 326.0069274902344 L 959.0799560546875 333.9915771484375 L 957.777099609375 339.6599731445312 C 957.777099609375 339.6599731445312 958.5789794921875 343.9699401855469 959.0799560546875 345.3905334472656 Z"
                />
              </svg>
              <svg
                data-layer="1ff4c410-85a6-4977-9cb1-e5aa95bed05d"
                preserveAspectRatio="none"
                viewBox="947.4942016601562 382.6012268066406 18.07830810546875 21.287384033203125"
                className="path4"
              >
                <path
                  d="M 959.9974975585938 382.6012268066406 L 960.1597900390625 386.142822265625 L 960.343017578125 387.6409606933594 L 961.8519287109375 393.7096252441406 L 965.572509765625 403.6167297363281 L 953.6867065429688 403.8886108398438 L 947.4942016601562 398.1919860839844 L 948.97021484375 388.7085876464844 L 955.3028564453125 383.1249389648438 L 959.9974975585938 382.6012268066406 Z"
                />
              </svg>
              <svg
                data-layer="7d3be46a-b301-4f2c-8d56-47bd02888d90"
                preserveAspectRatio="none"
                viewBox="0 -0.5 29 1"
                className="line1"
              >
                <path d="M 0 0 L 29 0" />
              </svg>
              <div data-layer="6646b79f-b68e-4013-817a-c97b2de52deb" className="group5">
                                  {/* <label
                  data-layer="85295dbb-1f46-4602-a1f6-0d22455f12ba"
                  className="emailAddress"
                >
                  Email address
                </label> */}
                <input
                  data-layer="f5794e1e-395b-4f35-8461-115b4493e8ef"
                  className="rectangle2"
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  placeholder="Email address"
                />

              </div>
              <div data-layer="c92f5ecd-87d5-4f67-a363-48251ee22040" className="group4">
                <input
                  data-layer="a1e61ada-5893-4972-af84-6f457cea2143"
                  className="rectangle3"
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  placeholder="Password"
                />
                {/* <label data-layer="190883ef-65a2-47b0-bb61-2a2a788c04b7" className="password">
                  Password
                </label> */}
              </div>
              </form>
              <div
                data-layer="422f02d8-6d83-4efe-8122-ed187383ad15"
                className="rectangle11"
              ></div>
              <div
                data-layer="39e20b28-5fcf-426e-894d-965073f9da5b"
                className="playGameworksLtdCopyright2020"
              >
                Play Gameworks Ltd. Copyright 2020
              </div>
              <div
                data-layer="38dec609-e68b-4dd4-904e-6329d70e0d53"
                className="playmahjong"
              ></div>
              <div
                data-layer="a7337bd3-98c7-47f6-96e3-5bcf0ea277c0"
                className="component111"
              >
                <svg
                  data-layer="eaf7037d-1b3f-4694-a384-3709c0a10f6a"
                  preserveAspectRatio="none"
                  viewBox="0 0 34 34"
                  className="ellipse1"
                >
                  <path
                    d="M 17 0 C 26.38883972167969 0 34 7.611159324645996 34 17 C 34 26.38883972167969 26.38883972167969 34 17 34 C 7.611159324645996 34 0 26.38883972167969 0 17 C 0 7.611159324645996 7.611159324645996 0 17 0 Z"
                  />
                </svg>
                <div
                  data-layer="fa5ea364-c967-4ef1-ad20-d910cf3d093a"
                  className="x0c3b3adb1a7530892e55ef36d3be6cb8"
                ></div>
              </div>
            </div>
            ​ ​
          </body>
        </div>    

        )
    }
  }
}

export default Login;