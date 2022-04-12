import React from 'react';
import Container from "react-bootstrap/Container";
import GlobalNavigation from '../components/GlobalNavigation';
import NewSession from "../components/NewSession";
import Templates from '../components/Templates';

const WorkoutPage = () => {

  return (

    <Container>

      <GlobalNavigation />

      <h1>Start Workout</h1>
      <NewSession />

      <div id="templates">
        <Templates />
      </div>

    </Container>
  );
};

export default WorkoutPage;
