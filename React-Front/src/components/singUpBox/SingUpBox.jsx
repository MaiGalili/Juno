import React from "react";
import "./singUp.modules.css";

const SignUp = () => {
  return (
    <div className="signup-container">
      <h1 className="signup-title">Hello Newcomer!</h1>

      <div className="text-field">
        <input
          type="email"
          class="text-input"
          name="email"
          autocomplete="email"
          placeholder="Enter your email"
        />
      </div>

      <div className="text-field">
        <input type="password" placeholder="Password" className="text-input" />
      </div>

      <div className="text-field">
        <input
          type="Password"
          placeholder="Retype Password"
          className="text-input"
        />
      </div>

      <button className="signup-button">Sign Up</button>
    </div>
  );
};

export default SignUp;
