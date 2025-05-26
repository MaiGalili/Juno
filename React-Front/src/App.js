import { Routes, Route, BrowserRouter } from "react-router-dom";

import Header from "./components/header/Header.jsx";
import Footer from "./components/footer/Footer.jsx";

import LandingPage from "./pages/landingPage/LandingPage.jsx";
import Calendar from "./pages/mainPage/MainPage.jsx";
import Error404 from "./pages/error404/Error404.jsx";
import { useState } from "react";
import { Navigate } from "react-router-dom";

function App() {
  const [isLoggin, setIsLoggin] = useState(false);
  console.log(isLoggin);
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage setIsLoggin={setIsLoggin} />} />
          <Route path="*" element={<Error404 />} />
          <Route
            path="/calendar"
            element={
              isLoggin ? (
                <Calendar isLoggin={isLoggin} setIsLoggin={setIsLoggin} />
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
