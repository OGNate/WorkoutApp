import React from 'react';
import Exercises from '../components/Exercises';
import GlobalNavigation from '../components/GlobalNavigation';

const ExercisePage = () => {

  return (

    <div>

      <GlobalNavigation />

      <h1>Exercises</h1>
      <Exercises />

    </div>
  );
};

export default ExercisePage;
