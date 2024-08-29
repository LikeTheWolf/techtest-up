import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import React from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

import AboutPage from "./pages/About";
import HomePage from "./pages/HomePage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        {/* Blueprint.js Navbar */}
        <Navbar>
          <NavbarGroup>
            <NavbarHeading>My App</NavbarHeading>
            <NavbarDivider />
            <Link to="/"><Button className="bp3-minimal" icon="home" text="Home" /></Link>
            <Link to="/about"><Button className="bp3-minimal" icon="info-sign" text="About" /></Link>
          </NavbarGroup>
        </Navbar>
        
        {/* React Router Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
