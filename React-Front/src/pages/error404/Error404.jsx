//Error404.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./error404.module.css";

function Error404() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>
        {/* Error message subtitle */}
        Oops! The page you're looking for doesn't exist.
      </p>
      {/* Link to return to homepage */}
      <Link to="/" className={styles.homeLink}>
        Go back home
      </Link>
    </div>
  );
}

export default Error404;
