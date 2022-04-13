import React from 'react';
import Container from "react-bootstrap/Container";
import DisplayedName from '../components/DisplayedName';
import GlobalNavigation from '../components/GlobalNavigation';

const HomePage = () => {

  return (

    <>
    <Container>
      <GlobalNavigation />
      <DisplayedName />
    </Container>
    </>
  );
};

export default HomePage;
