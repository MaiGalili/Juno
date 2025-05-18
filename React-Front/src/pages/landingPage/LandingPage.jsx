import styles from "./landingPage.module.css";
import React from "react";
import { Link } from "react-router-dom";
import LoginBox from "../../components/loginBox/LoginBox.jsx";
import SignUp from "../../components/singUpBox/SingUpBox.jsx";
import ForgotPassword from "../../components/forgotPassword/ForgotPassword.jsx";
import About from "../../components/about/About.jsx";

function LandingPage() {
  return (
    <div>
      Landing page
      <LoginBox />
      <ForgotPassword />
      <SignUp />
      <About />
    </div>
  );
}

export default LandingPage;
