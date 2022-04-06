import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';


function App() {

  return (

    <Router >
      <Switch>

      <Route path="/" exact>
          <LandingPage />
        </Route>

        <Route path="/login" exact>
          <LoginPage />
        </Route>

        <Route path="/register" exact>
          <RegisterPage />
        </Route>

        <Route path="/verify-account" exact>
          <VerifyAccountPage />
        </Route>

        <Route path="/dashboard" exact>
          <DashboardPage />
        </Route>

        <Redirect to="/" />

      </Switch>  
    </Router>
  );
}

export default App;