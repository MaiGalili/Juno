import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";

import LandingPage from "./pages/landingPage/LandingPage.jsx";
import Calendar from "./pages/mainPage/MainPage.jsx";
import Error404 from "./pages/error404/Error404.jsx";

function App() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8801/manageLogin/getSession", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserEmail(data.userEmail);
        }
      });
  }, []);

  const isLoggin = userEmail !== null;

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={<LandingPage setIsLoggin={setUserEmail} />}
          />
          <Route path="*" element={<Error404 />} />
          <Route
            path="/calendar"
            element={
              isLoggin ? (
                <Calendar
                  isLoggin={isLoggin}
                  setIsLoggin={setUserEmail}
                  userEmail={userEmail}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
