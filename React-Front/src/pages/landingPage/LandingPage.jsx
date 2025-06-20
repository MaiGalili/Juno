//LandingPage.jsx
import styles from "./landingPage.module.css";
import { useState } from "react";

// Components
import Hero from "../../components/landingPageComponents/hero/Hero.jsx";
import About from "../../components/landingPageComponents/about/About.jsx";
import Footer from "../../components/landingPageComponents/footer/Footer.jsx";
import Header from "../../components/landingPageComponents/header/Header.jsx";
import Help from "../../components/landingPageComponents/help/Help.jsx";
import WhyJuno from "../../components/landingPageComponents/whyJuno/WhyJuno.jsx";

function LandingPage({ setIsLoggin }) {
  return (
    <div className={styles.container}>
      {/* Top of page - Navigation and Logo */}
      <div id="top">
        <Header />
      </div>
      {/* Hero section with login/signup box */}
      <Hero setIsLoggin={setIsLoggin} />
      {/* About section (with scroll anchor) */}
      <div id="about">
        <About />
      </div>
      {/* Why Juno section (benefits/advantages) */}
      <WhyJuno />
      {/* Help / FAQ section (with scroll anchor) */}
      <div id="help">
        <Help />
      </div>
      {/* Bottom of page */}
      <Footer />
    </div>
  );
}

export default LandingPage;
