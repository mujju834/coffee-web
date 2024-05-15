import React, { useState } from "react";
import axios from "axios";
import './RegistrationForm.css'
const config = require("../config.json");


const RegistrationForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        `http://${config.publicIpAddress}:5000/user/register`,
        { username, email, password }
      );
      if (response.data.success) {
        setMessage("Register successfully");
        window.location.href = '/menu';
      } else {
        setMessage("Register failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error.message);
      setMessage("Internal server error");
    }
  };

  return (
    <div className="registration-form-page">
      <div className="registration-form-container">
        <h2 className="form-title">Registration Form</h2>
        <input
          className="form-input"
          type="text"
          placeholder="User name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="form-input"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="form-button" onClick={handleRegister}>Register</button>
        <p className="message-display">{message}</p>
      </div>
    </div>
  );
};

export default RegistrationForm;
