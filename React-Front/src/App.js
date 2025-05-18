import { Routes, Route, BrowserRouter } from "react-router-dom";

import Header from "./components/header/Header.jsx";
import Footer from "./components/footer/Footer.jsx";

import LandingPage from "./pages/landingPage/LandingPage.jsx";
import Calendar from "./pages/mainPage/MainPage.jsx";
import Error404 from "./pages/error404/Error404.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <//Route path="/post/:id" element={<SinglePost />} /> */}
          <Route path="*" element={<Error404 />} />
          {/* after login! */}
          <Route path="/calendar" element={<Calendar />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
