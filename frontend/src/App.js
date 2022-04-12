import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
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
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

function App() {

  return (

    <BrowserRouter>
      <Switch>

        <PublicRoute restricted={false} component={LandingPage} path="/" exact />
        <PublicRoute restricted={true} component={LoginPage} path="/login" exact />
        <PublicRoute restricted={true} component={RegisterPage} path="/register" exact />
        <PublicRoute restricted={true} component={VerifyAccountPage} path="/verify-account" exact />

        <PrivateRoute component={HomePage} path="/home" exact />
        <PrivateRoute component={HistoryPage} path="/history" exact />

        <PrivateRoute component={WorkoutPage} path="/workout" exact>
        </PrivateRoute>

        <PrivateRoute component={ExercisePage} path="/exercises" exact />
        <PrivateRoute component={ProfilePage} path="/profile" exact />

      </Switch>
    </BrowserRouter>
  );
}

export default App;