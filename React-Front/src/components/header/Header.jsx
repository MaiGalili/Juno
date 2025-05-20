import { Link } from "react-scroll";
import styles from "./header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li>
            <Link to="top" smooth={true} duration={100}>
              Juno
            </Link>
          </li>
          <li>
            <Link to="about" smooth={true} duration={100}>
              About
            </Link>
          </li>
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
