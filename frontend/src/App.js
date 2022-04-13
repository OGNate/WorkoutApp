import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import ActiveSessionPage from "./pages/ActiveSessionPage";
import ExercisePage from './pages/ExercisePage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import WorkoutPage from "./pages/WorkoutPage";
import PrivateRoute from "./routes/PrivateRoute";

function App() {

  return (
    <>
      <Routes>

      <Route index element={<LandingPage />} />

      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route path="verify-account" element={<VerifyAccountPage />} />

      <Route path="test" element={<VerifyAccountPage />}>
        <Route path="new" element={<ActiveSessionPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        
        <Route path="home" element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />

        <Route path="workout" element={<WorkoutPage />}>
          <Route path=":sessionId" element={<ActiveSessionPage />} />
        </Route>
        
        <Route path="exercises" element={<ExercisePage />} />
        <Route path="profile" element={<ProfilePage />} />
      
      </Route>

      </Routes>
    </>
  )
}

export default App;