import React from 'react';
import Button from "react-bootstrap/Button";
import { Link } from 'react-router-dom';
import GlobalNavigation from '../components/GlobalNavigation';

function LandingPage() {

  return (

    <>
      <GlobalNavigation />

      <Link to="/login">
        <Button>Login</Button>
      </Link>

      <Link to="/register">
        <Button>Register</Button>
      </Link>
   </>
  );
};

export default LandingPage;