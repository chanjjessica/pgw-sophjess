import React, { Component } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import axios from "axios";
// import { Provider } from "react-redux";


import './App.css';
import Welcome from "./components/layout/Welcome";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/layout/Dashboard";
import Host from "./components/game/Host";
import Join from "./components/game/Join";
import GameRoom from "./components/game/GameRoom";
import FoundBug from "./components/layout/FoundBug";
//import HandView from "../../ui/gameroom"

class App extends Component {
  constructor() {
    super()
    this.state = {
      loggedIn: false,
      email: null
    }

    this.getUser = this.getUser.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  componentDidMount() {
    this.getUser()
  }

  updateUser (userObject) {
    this.setState(userObject)
  }

  getUser() {
    try{
    axios.get('/').then(response => {
      console.log('Get user response: ')
      //console.log(response.data)
      if (response.data.user) {
        console.log('Get User: There is a user saved in the server session: ')

        this.setState({
          loggedIn: true,
          email: response.data.user.email
        })
      } else {
        console.log('Get user: no user');
        this.setState({
          loggedIn: false,
          email: null
        })
      }
    })
  }
  catch (err) {
    console.warn(err);
  }
  }

  render() {
    return (
        <Router>
          <div className="App">
            <Route exact path="/" component={Welcome} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" render={() => <Login updateUser={this.updateUser}/>} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/host" component={Host} />
            <Route exact path="/join" component={Join} />
            <Route exact path="/gameroom" component={GameRoom} />
          </div>
        </Router>

    );
  }
}

export default App;
