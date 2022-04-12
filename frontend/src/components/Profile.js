import axios from "axios";
import React from "react";
import tokenStorage from '../tokenStorage';

function Profile() {

  var bp = require("./Path.js");

  var obj = {
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var config = {
    
    method: "POST",
    url: bp.buildPath("api/displayAllBodyParts"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  axios(config).then(function (response) {

  }).catch(function (error) {
    console.log(error);
  });

  return (
    <p>Hi</p>
  );
};

export default Profile;