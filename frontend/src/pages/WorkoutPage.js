import React from 'react';
import Container from "react-bootstrap/Container";
import { Outlet } from "react-router-dom";
import Templates from '../components/exercises/Templates';
import GlobalNavigation from '../components/GlobalNavigation';
import NewSession from "../components/NewSession";

const WorkoutPage = () => {

  return (
    
    <>
      <Container>

        <GlobalNavigation />

        <h1>Start Workout</h1>
        <NewSession />

        <div id="templates">
          <Templates />
        </div>

      </Container>

      <Outlet />
    </>
  );
};

export default WorkoutPage;
