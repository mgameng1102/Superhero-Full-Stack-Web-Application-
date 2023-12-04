import React, { useState } from "react";
import axios from 'axios';

export const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("http://localhost:8000/login/password", {
      email: email,
      password: password,
    })
      .then(response => {
        setErrorMessage(response.data.message);
        setToken(response.data.token);
        console.log(token);
        props.onLogin(response.data.token);

        // You can handle success, e.g., redirect to a dashboard
      })
      .catch(error => {
        console.error(error.response.data.message);
        // You can handle errors here
        setErrorMessage(error.response.data.message);
      });
  }


    return (
        <div className="front-form-container">
            <h2>Login</h2>
            <form className="login-form" >
                <label for = "email"> Email</label>
                <input value ={email} onChange= {(e)=> setEmail(e.target.value)} type ="email" placeholder="email"  id="email" name="email"/>

                <label for = "password"> Password</label>
                <input value = {password} onChange= {(e)=> setPass(e.target.value)} type="password" placeholder="**********" id="password" name = "password"/>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                
            </form>
            <button onClick={handleSubmit} className="login-btn" type="login">Log in</button>
            <button className = "link-btn" onClick={() => props.onFormSwitch('register')} > Don't have an account? Register here</button>
            <button className = "link-btn" onClick={() => props.onFormSwitch('update')} > Forgot Password? Update here</button>
        </div>
    )
    
}