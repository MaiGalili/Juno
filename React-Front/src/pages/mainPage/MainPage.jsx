import React from "react";
import classes from "./mainPage.module.css";
import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";
import TaskPanel from "../../components/mainPageComponents/taskPanel/TaskPanel";
import LogoutButton from "../../components/mainPageComponents/logoutButton/LogoutButton";

function MainPage({ isLoggin, setIsLoggin, userEmail }) {
  console.log("User Email:", userEmail);

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h2>Main Page</h2>
        <LogoutButton setIsLoggin={setIsLoggin} />
      </header>

      <div className={classes.mainContent}>
        <Sidebar userEmail={userEmail} />
        <TaskPanel userEmail={userEmail} />
      </div>
    </div>
  );
}

export default MainPage;
