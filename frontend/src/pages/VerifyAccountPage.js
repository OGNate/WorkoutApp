import React from 'react';
import { Container } from "react-bootstrap";
import { Outlet } from 'react-router-dom';
import GlobalNavigation from '../components/GlobalNavigation';

const VerifyAccountPage = (props) => {
  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  return (
    <>
      <Container>
        <GlobalNavigation />
        <p>An email was sent to: {ud.email}</p>
      </Container>

      <Outlet />
    </>
  );
};

export default VerifyAccountPage;