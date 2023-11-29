import React, {useState} from "react";
export const Login = (props) => {
    const[username, setUsername] = useState('');
    const[password, setPass]= useState('');

    const handleSubmit = (e) =>{
        e.preventDefault();
        console.log(username);
}
    return (
        <div className="auth-form-container">
            <h2>Login</h2>
            <form className="login-form" onLogin={handleSubmit}>
                <label for = "username"> Username</label>
                <input value ={username} onChange= {(e)=> setUsername(e.target.value)} type ="username" placeholder="Username"  id="email" name="email"/>

                <label for = "password"> Password</label>
                <input value = {password} onChange= {(e)=> setPass(e.target.value)} type="password" placeholder="**********" id="password" name = "password"/>
                <button className="login-btn" type="login">Log in</button>
            </form>

            <button className = "link-btn" onClick={() => props.onFormSwitch('register')}> Don't have an account? Register here</button>
        </div>
    )
    
}