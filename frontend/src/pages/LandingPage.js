import React from 'react';
import { Button, Container } from "react-bootstrap";
import { Link } from 'react-router-dom';
function LandingPage() {

  return (
    <>
    <Container>
    <Link to="/login">
        <Button>Login</Button>
      </Link>

      <Link to="/register">
        <Button>Register</Button>
      </Link>
    </Container>
   </>
  );
};

export default LandingPage;