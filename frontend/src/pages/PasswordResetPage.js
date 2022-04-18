import React from "react";
import Container from "react-bootstrap/Container";
import { Outlet } from 'react-router-dom';
import PasswordReset from "../components/auth/PasswordReset";

function PasswordResetPage() {

  return (
    <>
      <Container>
        <PasswordReset />
      </Container>

      <Outlet />
    </>
  );
}

export default PasswordResetPage;