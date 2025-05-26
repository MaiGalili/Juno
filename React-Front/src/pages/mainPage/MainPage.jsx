import React from "react";
import classes from "./mainPage.module.css";

function MainPage({ isLoggin, setIsLoggin }) {
  console.log(isLoggin);
  return (
    <div>
      Main page
      <button onClick={() => setIsLoggin(false)}>Log out</button>
    </div>
  );
}

export default MainPage;
