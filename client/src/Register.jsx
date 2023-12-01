import React, {useState} from "react";
import axios from  'axios';

export const Register = (props) => {
    const[username, setUsername] = useState('');
    const[password, setPass]= useState('');
    const[email, setEmail]=useState('');
    const[nickname, setNick] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);




    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password || !email || !nickname) {
            setErrorMessage("All fields are required");
            return;
          }
        // Call your server's create route here
        axios.post(`http://localhost:8000/api/users/create/${email}/${username}/${password}/${nickname}`)
            .then(response => {
                setErrorMessage(response.data.message);
                // You can handle success, e.g., redirect to login page
            })
            .catch(error => {
                console.error(error.response.data.message);
                // You can handle errors here
                setErrorMessage(error.response.data.message);
            });
    }

    return (
        <div className="front-form-container">
            <h2>Register</h2>
            <form className="register-form" onLogin={handleSubmit}>
                <label for = "username"> Username</label>
                <input value ={username} onChange= {(e)=> setUsername(e.target.value)} type ="username" placeholder="Username"  id="email" name="email"/>

                <label for = "password"> Password</label>
                <input value = {password} onChange= {(e)=> setPass(e.target.value)} type="password" placeholder="**********" id="password" name = "password"/>

                <label for = "nickname">Nickname</label>
                <input value = {nickname} onChange= {(e)=> setNick(e.target.value)} type="nickname" placeholder="Nickname" id="nickname" name = "nickname"/>

                <label for = "email"> Email</label>
                <input value = {email} onChange= {(e)=> setEmail(e.target.value)} type="email" placeholder="Email" id="email" name = "email"/>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
            <button className = "register-btn" onClick={() => props.onFormSwitch('login')}>Login</button>
            <button className = "register-btn" onClick={handleSubmit}>Create Account</button>

        </div>
    )
    
}