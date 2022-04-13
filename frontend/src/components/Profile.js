import axios from "axios";
import React, { useEffect, useState } from "react";
import tokenStorage from '../tokenStorage';

function Profile() {

  var bp = require("./Path.js");

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [userInfo, setUserInfo] = useState([]);

  var obj = {
    "userId": ud.userId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var configUserDetails = {
    
    method: "POST",
    url: bp.buildPath("api/userDetails"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  const [userStats, setUserStats] = useState([]);

  var configUserStats = {
    
    method: "POST",
    url: bp.buildPath("api/displayUserStats"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  useEffect(() => {
      
    axios(configUserDetails).then(function (response) {
      setUserInfo(response.data.user);
    }).catch(function (error) {
      console.log(error);
    });

    axios(configUserStats).then(function (response) {
      setUserStats(response.data.userStats);
    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  return (
    <>
      <h1>{userInfo._id}</h1>
      <h3>{userInfo.firstName} {userInfo.lastName}</h3>
      <h5>Joined {userInfo.createdAt}</h5>
      <h3>Goal: {userInfo.goal}</h3>

      <h3>Number of workouts: N/A</h3>
      <h3>Time recorded: {userStats.totalTime}</h3>
      <h3>Weight recorded: {userStats.totalWeight}</h3>

      <h3>Total reps: N/A</h3>
      <h3>Distance recorded: {userStats.totalDistance}</h3>
    </>
  );
};

export default Profile;