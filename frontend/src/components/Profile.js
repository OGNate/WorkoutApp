import axios from "axios";
import React, { useEffect, useState } from "react";
import tokenStorage from '../tokenStorage';

function Profile() {

  var bp = require("./Path.js");

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [info, setInfo] = useState([]);

  var obj = {
    "userId": ud.userId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var config = {
    
    method: "POST",
    url: bp.buildPath("api/userDetails"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  useEffect(() => {
      
    axios(config).then(function (response) {

    var res = response.data;
    setInfo(res.user);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  return (
    <>
      <h3>{info.firstName} {info.lastName}</h3>
      <h5>Joined {info.createdAt}</h5>
      <h3>Goal: {info.goal}</h3>
    </>
  );
};

export default Profile;