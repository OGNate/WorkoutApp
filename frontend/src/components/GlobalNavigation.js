import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';

function GlobalNavigation() {

  return (
    <>
      <Navbar collapseOnSelect sticky='top' expand='sm'>
        <Container>
          <Navbar.Toggle aria-controls='responsive-navbar-nav'/>
          
          <Navbar.Brand href="/home">
            <img
              src="../../shreddit-logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Project Logo"
            />
          </Navbar.Brand>
          
          <Navbar.Collapse id='responsive-navbar-nav'>
            
            <Nav>
              <Nav.Link href="/home">Home</Nav.Link>
              <Nav.Link href="/history">History</Nav.Link>
              <Nav.Link href="/workout">Workout</Nav.Link>
              <Nav.Link href="/exercises">Exercises</Nav.Link>
              <Nav.Link href="/profile">Profile</Nav.Link>
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default GlobalNavigation;