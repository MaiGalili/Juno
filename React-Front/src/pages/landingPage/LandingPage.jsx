import styles from "./landingPage.module.css";
import Hero from "../../components/hero/Hero.jsx";
import About from "../../components/about/About.jsx";
import Footer from "../../components/footer/Footer.jsx";
import Header from "../../components/header/Header.jsx";
import Help from "../../components/help/Help.jsx";
import WhyJuno from "../../components/whyJuno/WhyJuno.jsx";
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
