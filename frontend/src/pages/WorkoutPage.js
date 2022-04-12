import React from 'react';
import GlobalNavigation from '../components/GlobalNavigation';
import NewSession from "../components/NewSession";
import Templates from '../components/Templates';

const WorkoutPage = () => {

  return (

    <div>

      <GlobalNavigation />

      <h1>Start Workout</h1>
      <NewSession />
      
      <div id="templates">
        <Templates />
      </div>

    </div>
  );
};

export default WorkoutPage;
