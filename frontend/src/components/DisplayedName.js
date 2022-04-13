import React from 'react';
import Button from "react-bootstrap/Button";
import tokenStorage from '../tokenStorage';

function DisplayedName() {

  const logout = event => {
    event.preventDefault();
    tokenStorage.removeToken();
    window.location.href = '/';
  };

  return(
   <div id="loggedInDiv">
    <Button type="button" id="logoutButton" className="buttons" 
      onClick={logout}> Log Out </Button>
   </div>
  );
};

export default DisplayedName
