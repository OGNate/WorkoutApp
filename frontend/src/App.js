import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import ExercisePage from './pages/ExercisePage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import WorkoutPage from './pages/WorkoutPage';

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

        <Route path="/home" exact>
          <HomePage />
        </Route>

        <Route path="/history" exact>
          <HistoryPage />
        </Route>

        <Route path="/workout" exact>
          <WorkoutPage />
        </Route>

        <Route path="/exercises" exact>
          <ExercisePage />
        </Route>

        <Route path="/profile" exact>
          <ProfilePage />
        </Route>

        <Redirect to="/" />

      </Switch>  
    </Router>
  );
}

export default App;