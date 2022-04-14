import axios from "axios";
import { DateTime } from "luxon";
import React from "react";
import Button from "react-bootstrap/Button";

function NewSession() {

  return (
    <Button onClick={ createSession }>
      New Workout
    </Button>
  )
}

const createSession = () => {

  var bp = require("../utils/Path.js");
  var storage = require("../tokenStorage.js");

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  var dt = DateTime.now();
  var sessionName = "Workout from " + dt.toISODate() + " at " + dt.toLocaleString(DateTime.TIME_24_WITH_SECONDS);

  var obj = {
    userID: ud.userId,
    sessionName: sessionName,
    jwtToken: storage.retrieveToken(),
  };

  var js = JSON.stringify(obj);
  var config = bp.apiCall("api/addSession", js);

  axios(config).then(function (response) {

    var res = response.data;

    if (res.error) {
      console.log("Not sure that this would be possible")
      
    } else {
      
      var newId = res.sessionId;
      window.location.href = "/workout/" + newId;
    }

  }).catch(function (error) {
    console.log(error);
  });
}

export default NewSession;