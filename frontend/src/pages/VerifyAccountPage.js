import React from 'react';
import GlobalNavigation from '../components/GlobalNavigation';

const VerifyAccountPage = () => {

  return (

    <div>
      <GlobalNavigation />
      <p>An email was sent to: </p>
      <p>{this.props.location.state.email}</p>
    </div>
  );
};

export default VerifyAccountPage;