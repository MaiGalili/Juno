import React from "react";
import "./forgotPassword.modules.css";

function ForgotPassword() {
  return (
    <div class="forgot-password-box">
      <h1 class="title">Forgot Password?</h1>

      <div class="text-field">
        <input
          type="email"
          id="email"
          placeholder="Email"
          class="input-email"
        />
      </div>

      <button class="send-code-button">
        <span class="label-text">Send code to email</span>
      </button>

      <button class="back-button">
        <span class="label-text">Back to Log in</span>
      </button>
    </div>
  );
}

export default ForgotPassword;
