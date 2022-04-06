import React from 'react';
import { Link } from 'react-router-dom';
import GlobalNavigation from '../components/GlobalNavigation';

const HomePage = () => {

  return (

    <div>

      <GlobalNavigation />

      <h1>Dashboard</h1>

      <h3>Quick Links:</h3>

      <ul>

        <li>
          <Link to='/history'>Go to History</Link>
        </li>

        <li>
          <Link to='/workout'>Go to Workout</Link>
        </li>

        <li>
          <Link to='/exercises'>Go to Exercises</Link>
        </li>

        <li>
          <Link to='/profile'>Go to Profile</Link>
        </li>

      </ul>
      
    </div>
  );
};

export default HomePage;
