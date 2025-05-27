import React from "react";
import classes from "./mainPage.module.css";
import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";

function MainPage({ isLoggin, setIsLoggin }) {
  console.log(isLoggin);
  return (
    <div>
      Main page
      <button onClick={() => setIsLoggin(false)}>Log out</button>
      <Sidebar />
    </div>
  );
}

export default MainPage;
