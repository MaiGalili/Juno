import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";

import LandingPage from "./pages/landingPage/LandingPage.jsx";
import Calendar from "./pages/mainPage/MainPage.jsx";
import Error404 from "./pages/error404/Error404.jsx";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true); // מוסיפים מצב טעינה

  useEffect(() => {
    fetch("http://localhost:8801/api/auth/getSession", {
      credentials: "include", // חשוב: שולח את ה-session cookie
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserEmail(data.userEmail);
        }
      })
      .catch((err) => console.error("Session check failed:", err))
      .finally(() => setLoading(false)); // מסיים טעינה בכל מקרה
  }, []);

  const isLoggin = userEmail !== null;

  return (
    <BrowserRouter>
      <div className="App">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Loading...</h2>
          </div>
        ) : (
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
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
