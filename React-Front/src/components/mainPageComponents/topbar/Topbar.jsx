// components/mainPageComponents/topbar/Topbar.jsx
import React from "react";
import styles from "./topbar.module.css";
import SearchBar from "./searchBar/SearchBar";
import LogoutButton from "./logoutButton/LogoutButton";
import { FiSettings } from "react-icons/fi";

export default function TopBar({ onTaskSelect, setIsLoggin }) {
  return (
    <div className={styles.topbar}>
      {/* Left: Logo */}
      <div className={styles.logo}>Juno</div>

      {/* Center: Search */}
      <div className={styles.searchWrapper}>
        <SearchBar onPick={onTaskSelect} />
      </div>

      {/* Right: Settings + Logout */}
      <div className={styles.actions}>
        <button className={styles.settingsBtn} type="button" title="Settings">
          <FiSettings size={20} />
        </button>
        <LogoutButton setIsLoggin={setIsLoggin} />
      </div>
    </div>
  );
}
