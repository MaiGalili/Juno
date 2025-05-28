import React from "react";
import classes from "./mainPage.module.css";
import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";
import TaskPanel from "../../components/mainPageComponents/taskPanel/TaskPanel";

function MainPage({ isLoggin, setIsLoggin }) {
  console.log(isLoggin);
  return (
    <div>
      Main page
      <button onClick={() => setIsLoggin(false)}>Log out</button>
      <Sidebar />
      <TaskPanel />
    </div>
  );
}

export default MainPage;
