import React from 'react';
import Button from "react-bootstrap/Button";
import { Link } from 'react-router-dom';

function LandingPage() {

  return (
    <>
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