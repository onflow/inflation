import React from "react";
import MyBalloons from "./components/MyBalloons";
import NavBar from "./components/NavBar";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Inflation from "./components/Inflation";
import "./App.css";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Inflation />} />
          <Route exact path="/my_balloons" element={<MyBalloons />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <NavBar />
      </Router>
    </div>
  );
}

export default App;
