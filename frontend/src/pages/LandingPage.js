import React from 'react';
import { Button, Container } from "react-bootstrap";
import { Link } from 'react-router-dom';
function LandingPage() {

  return (
    <>
      <Container>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-light fixed-top">
              <div className="d-flex">
                <Link className="p-2 navbar-brand" to={"/login"}>Shreddit</Link>
                <Link className="p-2 nav-link" to={"/login"}>Sign in</Link>
                <Link className="p-2 ms-auto nav-link" to={"/register"}>Register</Link>
            </div>
          </nav>

        </div>
      </Container>
    </>
  );
};

export default LandingPage;