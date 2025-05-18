import React from "react";
import { Link } from "react-router-dom";
import styles from "./footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>
        &copy; {new Date().getFullYear()} Juno Calendar
      </p>
      <nav className={styles.footerNav}>
        <Link to="/">Juno</Link>
        <Link to="/about">About</Link>
        <Link to="/help">Help</Link>
      </nav>
    </footer>
  );
}

export default Footer;
