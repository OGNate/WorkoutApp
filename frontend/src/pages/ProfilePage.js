import React from 'react';
import Container from "react-bootstrap/Container";
import GlobalNavigation from '../components/GlobalNavigation';
import Profile from '../components/Profile';

const ProfilePage = () => {

  return (

    <Container>

      <GlobalNavigation />

      <h1>Profile</h1>
      <Profile />
      
    </Container>
  );
};

export default ProfilePage;
