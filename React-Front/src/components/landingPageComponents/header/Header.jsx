//Header.jsx
import { Link } from "react-scroll";
import styles from "./header.module.css";

function Header() {
  return (
    // Header wrapper
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          {/* Scrolls to top of the page */}
          <li>
            <Link to="top" smooth={true} duration={100}>
              Juno
            </Link>
          </li>

          {/* Scrolls to the "About" section */}
          <li>
            <Link to="about" smooth={true} duration={100}>
              About
            </Link>
          </li>

          {/* Scrolls to the "Help" section */}
          <li>
            <Link to="help" smooth={true} duration={100}>
              Help
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
