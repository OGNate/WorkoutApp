import React from 'react';
import tokenStorage from '../tokenStorage';

function DisplayedName() {
	
  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  var firstName = ud.firstName;
  var lastName = ud.lastName;

  console.log(ud);

  const doLogout = event => {
    event.preventDefault();
    tokenStorage.removeToken();
    window.location.href = '/';
  };

  return(
   <div id="loggedInDiv">
    <span id="userName">Name: {firstName} {lastName}</span><br />
    <button type="button" id="logoutButton" className="buttons" 
      onClick={doLogout}> Log Out </button>
   </div>
  );
};

export default DisplayedName