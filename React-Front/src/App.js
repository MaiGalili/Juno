import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api"; // ✅ הוספנו

import LandingPage from "./pages/landingPage/LandingPage.jsx";
import Calendar from "./pages/mainPage/MainPage.jsx";
import Error404 from "./pages/error404/Error404.jsx";

const libraries = ["places"]; // ✅ מוגדר פעם אחת כאן

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("API KEY:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    fetch("http://localhost:8801/api/auth/getSession", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserEmail(data.userEmail);
        }
      })
      .catch((err) => console.error("Session check failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const isLoggin = userEmail !== null;

  return (
    <BrowserRouter>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
      >
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
      </LoadScript>
    </BrowserRouter>
  );
}

export default App;
