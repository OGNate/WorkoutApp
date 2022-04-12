import React from 'react';
import tokenStorage from '../tokenStorage';

function DisplayedName() {
	
  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  //var firstName = ud.firstName;
  //var lastName = ud.lastName;

  const doLogout = event => {
    event.preventDefault();
    tokenStorage.removeToken();
    window.location.href = '/';
  };

  return(
   <div id="loggedInDiv">
     <h1></h1>
    <button type="button" id="logoutButton" className="buttons" 
      onClick={doLogout}> Log Out </button>
   </div>
  );
};

export default DisplayedName
