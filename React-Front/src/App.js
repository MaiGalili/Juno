//React-Front/src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api"; // חזרה לחבילה היציבה

// Page components
import LandingPage from "./pages/landingPage/LandingPage.jsx";
import Calendar from "./pages/mainPage/MainPage.jsx";
import Error404 from "./pages/error404/Error404.jsx";

// Google Maps libraries to load (for Places Autocomplete, etc.)
const libraries = ["places"];

function App() {
  // Logged-in user email
  const [userEmail, setUserEmail] = useState(null);

  // Used for session check state
  const [loading, setLoading] = useState(true);

  // Check if the user has an active session
  useEffect(() => {
    fetch("http://localhost:8801/api/auth/getSession", {
      credentials: "include", // Send cookies with request
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserEmail(data.userEmail);
        } // Set userEmail if session exists
      })
      .catch((err) => console.error("Session check failed:", err))
      .finally(() => setLoading(false)); // Stop loading either way
  }, []);

  const isLoggin = userEmail !== null; // Boolean: is the user logged in

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <BrowserRouter>
        <div className="App">
          {loading ? (
            // While checking session, show loading message
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>Loading...</h2>
            </div>
          ) : (
            <Routes>
              {/* Landing page (login/signup) */}
              <Route
                path="/"
                element={<LandingPage setIsLoggin={setUserEmail} />}
              />

              {/* 404- Any non-existent route */}
              <Route path="*" element={<Error404 />} />

              {/* Calendar page - requires login */}
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
                    // Redirect to login if not logged in
                    <Navigate to="/" />
                  )
                }
              />
            </Routes>
          )}
        </div>
      </BrowserRouter>
    </LoadScript>
  );
}

export default App;
