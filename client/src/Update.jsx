import React, {useState} from "react";
import axios from  'axios';

export const Update = (props) => {
    const[email, setEmail] = useState('');
    const[newPassword, setNewPass]= useState('');
    const[confPassword, setConfPass] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);




    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !newPassword) {
            setErrorMessage("All fields are required");
            return;
          }
          console.log(email)
          console.log(newPassword)
          console.log(confPassword)
        // Call your server's create route here
        axios.post(`/api/users/updatePass/${email}/${newPassword}/${confPassword}`)
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
            <h2>Update Password</h2>
            <form className="update-form" onLogin={handleSubmit}>

                <label for = "email"> Email</label>
                <input value = {email} onChange= {(e)=> setEmail(e.target.value)} type="email" placeholder="Email" id="email" name = "email"/>

                <label for = "password"> New Password</label>
                <input value = {newPassword} onChange= {(e)=> setNewPass(e.target.value)} type="password" placeholder="**********" id="password" name = "password"/>

                <label for = "confirm password"> Confirm Password</label>
                <input value = {confPassword} onChange= {(e)=> setConfPass(e.target.value)} type="password" placeholder="**********" id="password" name = "password"/>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
            <button className = "register-btn" onClick={handleSubmit}>Update</button>
            <button className = "register-btn" onClick={() => props.onFormSwitch('login')}>Login</button>
        </div>
    )
    
}