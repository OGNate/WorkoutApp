import React from 'react';
import GlobalNavigation from '../components/GlobalNavigation';

const VerifyAccountPage = (props) => {

  return (

    <div>
      <GlobalNavigation />
      <p>An email was sent to: {props.match.params.emailAddress}</p>
    </div>
  );
};

export default VerifyAccountPage;