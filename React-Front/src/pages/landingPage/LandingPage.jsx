import styles from "./landingPage.module.css";
import React from "react";
import { Link } from "react-router-dom";
import LoginBox from "../../components/loginBox/LoginBox.jsx";
import SignUp from "../../components/singUpBox/SingUpBox.jsx";
import ForgotPassword from "../../components/forgotPassword/ForgotPassword.jsx";
import About from "../../components/about/About.jsx";
import Footer from "../../components/footer/Footer.jsx";
import Header from "../../components/header/Header.jsx";
import Help from "../../components/help/Help.jsx";
import WhyJuno from "../../components/whyJuno/WhyJuno.jsx";

function LandingPage() {
  return (
    <div>
      <Header />
      {/* <LoginBox />
      <ForgotPassword />
      <SignUp />
      <About /> */}
      <WhyJuno />
      <Help />
      <Footer />
    </div>
  );
}

export default LandingPage;
