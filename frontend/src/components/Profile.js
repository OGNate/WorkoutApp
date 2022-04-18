import axios from "axios";
import {
  useState
} from "react";
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
  axios(configUserDetails).then(function(response) {
    setUserInfo(response.data.user);
  }).catch(function(error) {
    console.log(error);
  });
  axios(configUserStats).then(function(response) {
    let stats = {
      ...response.data.userStats,
      totalTime: convertHMS(response.data.userStats.totalTime)
    }
    setUserStats(stats);
    console.log(response.data);
  }).catch(function(error) {
    console.log(error);
  });
};

function convertHMS(value) {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
  let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds; // Return is HH : MM : SS
}

export default Profile;