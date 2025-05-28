import styles from "./landingPage.module.css";
import Hero from "../../components/landingPageComponents/hero/Hero.jsx";
import About from "../../components/landingPageComponents/about/About.jsx";
import Footer from "../../components/landingPageComponents/footer/Footer.jsx";
import Header from "../../components/landingPageComponents/header/Header.jsx";
import Help from "../../components/landingPageComponents/help/Help.jsx";
import WhyJuno from "../../components/landingPageComponents/whyJuno/WhyJuno.jsx";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

function LandingPage({ setIsLoggin }) {
  return (
    <div className={styles.container}>
      <div id="top">
        <Header />
      </div>
      <Hero setIsLoggin={setIsLoggin} />
      <div id="about">
        <About />
      </div>
      <WhyJuno />
      <div id="help">
        <Help />
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
