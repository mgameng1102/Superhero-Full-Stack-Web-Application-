import React, { useState, useEffect } from "react";
import "./App.css";
import "./login.css";
import {Login} from "./Login";
import { Register } from "./Register";
import { Update } from "./Update";

function App() {
  // const [message, setMessage] = useState("");

  // // useEffect(() => {
  // //   fetch("http://localhost:8000/message")
  // //     .then((res) => res.json())
  // //     .then((data) => setMessage(data.message));
  // // }, []);


  const[currentForm, setCurrentForm] = useState('login')
  const toggleForm = (formName) => {
    setCurrentForm(formName)
  }

  
  return (
    <div className="App">
      {
        currentForm === "login" ? <Login onFormSwitch={toggleForm} /> : (currentForm === "register" ? <Register onFormSwitch={toggleForm} /> : <Update onFormSwitch={toggleForm} />)
      }
    </div>
  );
}

export default App