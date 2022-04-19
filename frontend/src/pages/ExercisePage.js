import React from 'react';
import Container from "react-bootstrap/Container";
import Exercises from '../components/exercises/Exercises';
import GlobalNavigation from '../components/GlobalNavigation';

function helloWorld(params) {
  console.log("Hello " + params);
}

const ExercisePage = () => {

  return (

    <Container>

      <GlobalNavigation />

      <h1>Exercises</h1>
      <Exercises onNextAction={helloWorld} />

    </Container>
  );
};

export default ExercisePage;
