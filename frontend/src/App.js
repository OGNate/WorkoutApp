import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import ActiveSessionPage from "./pages/ActiveSessionPage";
import ExercisePage from './pages/ExercisePage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import VerifiedAccountPage from './pages/VerifiedAccountPage';
import WorkoutPage from "./pages/WorkoutPage";
import PrivateRoute from "./routes/PrivateRoute";

function App() {

  return (
    <>
      <Routes>

      <Route index element={<LandingPage />} />

      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route path="emailVerification" element={<Outlet />}>

          <Route path=":userID" element={<Outlet />}>
            <Route path=":uniqueEmailToken" element={<VerifiedAccountPage />} />
          </Route>

      </Route>

      <Route element={<PrivateRoute />}>
        
        <Route path="home" element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />

        <Route path="workout" element={<Outlet />}>
          <Route path=":sessionId" element={<ActiveSessionPage />} />
          <Route index element={<WorkoutPage />} /> 
        </Route>
        
        <Route path="exercises" element={<ExercisePage />} />
        <Route path="profile" element={<ProfilePage />} />
      
      </Route>

      </Routes>
    </>
  )
}

export default App;