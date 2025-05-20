import styles from "./landingPage.module.css";
import React from "react";
import { Link } from "react-router-dom";
import About from "../../components/about/About.jsx";
import Footer from "../../components/footer/Footer.jsx";
import Header from "../../components/header/Header.jsx";
import Help from "../../components/help/Help.jsx";
import WhyJuno from "../../components/whyJuno/WhyJuno.jsx";
import Hero from "../../components/hero/Hero.jsx";

function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <WhyJuno />
      <Help />
      <Footer />
    </div>
  );
}

export default LandingPage;
