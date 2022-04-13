import { faClock, faDumbbell, faMap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import tokenStorage from '../tokenStorage';

function Profile() {

  var bp = require("../utils/Path.js");

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [userInfo, setUserInfo] = useState([]);

  var obj = {
    "userId": ud.userId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);
  var configUserDetails = bp.apiCall("api/userDetails", js);

  const [userStats, setUserStats] = useState([]);

  var configUserStats = bp.apiCall("api/displayUserStats", js);

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
      <h3>{userInfo._id}</h3>
      <h3>{userInfo.firstName} {userInfo.lastName}</h3>
      <h3>Goal: {userInfo.goal}</h3>

      <h3>Number of workouts: N/A</h3>

      <h3>Time recorded: {userStats.totalTime}</h3>
      <FontAwesomeIcon icon={faClock} />

      <h3>Weight recorded: {userStats.totalWeight}</h3>
      <FontAwesomeIcon icon={faDumbbell} />

      <h3>Total reps: N/A</h3>

      <h3>Distance recorded: {userStats.totalDistance}</h3>
      <FontAwesomeIcon icon={faMap} />
    </>
  );
};

export default Profile;