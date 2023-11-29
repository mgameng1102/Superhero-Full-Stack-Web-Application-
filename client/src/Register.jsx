import React, {useState} from "react";
export const Register = (props) => {
    const[username, setUsername] = useState('');
    const[password, setPass]= useState('');
    const[email, setEmail]=useState('');
    const[nickname, setNick] = useState('');




    const handleSubmit = (e) =>{
        e.preventDefault();
        console.log(username);
    }
    return (
        <div className="register-form-container">
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
            </form>
            <button className = "register-btn" onClick={() => props.onFormSwitch('login')}>Create Account</button>
        </div>
    )
    
}