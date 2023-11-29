import React, {useState} from "react";
export const Login = (props) => {
    const[username, setUsername] = useState('');
    const[password, setPass]= useState('');

    const handleSubmit = (e) =>{
        e.preventDefault();
        axios.post(`http://localhost:8000/login/password`)
            .then(response => {
                console.log(response.data.message);
                // You can handle success, e.g., redirect to login page
            })
            .catch(error => {
                console.error(error.response.data.message);
                // You can handle errors here
                setErrorMessage(error.response.data.message);
            });
}
    return (
        <div className="auth-form-container">
            <h2>Login</h2>
            <form className="login-form" onLogin={handleSubmit} action="/login/password" method="post">
                <label for = "username"> Username</label>
                <input value ={username} onChange= {(e)=> setUsername(e.target.value)} type ="username" placeholder="Username"  id="email" name="email"/>

                <label for = "password"> Password</label>
                <input value = {password} onChange= {(e)=> setPass(e.target.value)} type="password" placeholder="**********" id="password" name = "password"/>
                <button className="login-btn" type="login">Log in</button>
            </form>

            <button className = "link-btn" onClick={() => props.onFormSwitch('register')} > Don't have an account? Register here</button>
        </div>
    )
    
}