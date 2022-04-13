import React from 'react';
import Container from "react-bootstrap/Container";
import Exercises from '../components/Exercises';
import GlobalNavigation from '../components/GlobalNavigation';

const ExercisePage = () => {

  return (

    <Container>

      <GlobalNavigation />

      <h1>Exercises</h1>
      <Exercises />

    </Container>
  );
};

export default ExercisePage;
