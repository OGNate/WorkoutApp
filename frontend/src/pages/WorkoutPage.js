import React from 'react';
import Button from "react-bootstrap/Button";
import GlobalNavigation from '../components/GlobalNavigation';
import Templates from '../components/Templates';

const WorkoutPage = () => {

  return (

    <div>

      <GlobalNavigation />

      <h1>Start Workout</h1>

      <Button>Start an Empty Workout</Button>
      
      <div id="templates">
        <Templates />
      </div>

    </div>
  );
};

export default WorkoutPage;
