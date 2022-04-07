import React, { Suspense } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import PrivateRoute from './routes/PrivateRoute';
import ProtectedRoutes from './routes/ProtectedRoutes'; //Authenticated routes
import PublicRoute from './routes/PublicRoute';
import tokenStorage from './tokenStorage';

function App() {
  
  const isAuthenticated = tokenStorage.retrieveToken();

  return (

    <Router >
      <Suspense fallback={<h1>Loading...</h1>}>

        <Switch>

          <Route path="/" exact>
            <LandingPage />
          </Route>

          <PublicRoute
            path="/login"
            isAuthenticated={isAuthenticated}
          >
            <LoginPage />
          </PublicRoute>

          <PublicRoute
            path="/register"
            isAuthenticated={isAuthenticated}
          >
            <RegisterPage />
          </PublicRoute>

          <PublicRoute
            path="/verify-account"
            isAuthenticated={isAuthenticated}
          >
            <VerifyAccountPage />
          </PublicRoute>

          <PrivateRoute
            path="/"
            isAuthenticated={isAuthenticated}
          >
            <ProtectedRoutes />
          </PrivateRoute>

          <Redirect to="/" />

        </Switch>

      </Suspense>
    </Router>
  );
}

export default App;