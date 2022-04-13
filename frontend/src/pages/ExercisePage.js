import React from 'react';
import Container from "react-bootstrap/Container";
import Exercises from '../components/exercises/Exercises';
import GlobalNavigation from '../components/GlobalNavigation';

const ExercisePage = () => {

  return (

    <Container>

      <GlobalNavigation />

      <h1>Exercises</h1>
      <Exercises inSession={false} />

    </Container>
  );
};

export default ExercisePage;
