import React, { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";
import { Update } from "./Update";
import "./App.css";
import "./login.css";
import{Component} from "react";

function App() {
  const [currentForm, setCurrentForm] = useState('unauthorized');

  const switchToLogin = () => {
    setCurrentForm("login");
  };

  const switchToRegister = () => {
    setCurrentForm("register");
  };

  return (
    <div className="App">
      {currentForm === "unauthorized" && (
        <Unauthorized onFormSwitch={switchToLogin} />
      )}
      {currentForm === "login" && (
        <Login onFormSwitch={switchToRegister} />
      )}
      {currentForm === "register" && (
        <Register onFormSwitch={switchToLogin} />
      )}
      {currentForm === "update" && (
        <Update onFormSwitch={switchToLogin} />
      )}
    </div>
  );
}

class Unauthorized extends Component {
  state = { clicked: false };

  render() {
    return (
    
      <>
        <nav className="top-nav">
          <div>
            <ul id="nav-bar">
              <p> SUPERHERO LISTS</p>
              <li><a href="index.html">Search Heros</a></li>
              <li><a href="index.html">Public Hero Lists</a></li>
              <li><a href="#!" onClick={this.props.onFormSwitch}>Login</a></li>
            </ul>
          </div>
          <div id="mobile">
            <i id="bar" className={this.state.clicked ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
        </nav>
      </>
    );
  }
}


export default App;