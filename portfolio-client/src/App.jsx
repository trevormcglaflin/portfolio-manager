import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import NavBar from "./components/NavBar";
import AppRoutes from "./components/AppRoutes";

function App() {
  return (
    <Router>
      <div className='app-container'>
        <NavBar />
        <AppRoutes />
      </div>
    </Router>
  )
}

export default App;
