import React from "react";
import { Link } from "react-scroll";
import styles from "./footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>
        &copy; {new Date().getFullYear()} Juno Calendar
      </p>
      <nav className={styles.footerNav}>
        <Link to="top" smooth={true} duration={100}>
          Juno
        </Link>
        <Link to="about" smooth={true} duration={100}>
          About
        </Link>
        <Link to="help" smooth={true} duration={100}>
          Help
        </Link>
      </nav>
    </footer>
  );
}

export default Footer;
