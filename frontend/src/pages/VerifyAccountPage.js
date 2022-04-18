import React from 'react';
import { Container } from "react-bootstrap";
import { Outlet } from 'react-router-dom';
import GlobalNavigation from '../components/GlobalNavigation';

const VerifyAccountPage = (props) => {

  return (
    <>
      <Container>
        <GlobalNavigation />
        <p>An email was sent to:</p>
      </Container>

      <Outlet />
    </>
  );
};

export default VerifyAccountPage;