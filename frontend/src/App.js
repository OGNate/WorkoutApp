import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import DashboardPage from './pages/DashboardPage';

function App() {

  return (

    <Router >
      <Switch>

        <Route path="/" exact>
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