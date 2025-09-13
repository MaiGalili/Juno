// components/mainPageComponents/topbar/Topbar.jsx
import React, { useState } from "react";
import styles from "./topbar.module.css";
import SearchBar from "./searchBar/SearchBar";
import LogoutButton from "./logoutButton/LogoutButton";
import { FiSettings } from "react-icons/fi";
import Settings from "./settings/Settings";

export default function TopBar({ onTaskSelect, setIsLoggin }) {
  const [open, setOpen] = useState(false); // settings modal visibility

  return (
    <div className={styles.topbar}>
      {/* Left: Logo */}
      <div className={styles.logo}>Juno</div>

      {/* Center: global task search; onPick open selected task */}
      <div className={styles.searchWrapper}>
        <SearchBar onPick={onTaskSelect} />
      </div>

      {/* Right: Settings + Logout */}
      <div className={styles.actions}>
        <button
          className={styles.settingsBtn}
          type="button"
          title="Settings"
          onClick={() => setOpen(true)}
        >
          <FiSettings size={20} />
        </button>
        <LogoutButton setIsLoggin={setIsLoggin} />
      </div>

      {/* render the modal */}
      <Settings open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
