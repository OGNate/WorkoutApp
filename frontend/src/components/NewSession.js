import axios from "axios";
import { DateTime } from "luxon";
import React from "react";
import { Button } from "react-bootstrap";

function NewSession() {

  return(
    <Button onClick={createSession}>New Workout</Button>
  )
}

function createSession() {

  var bp = require("./Path.js");
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

  var config = {
    
    method: "POST",
    url: bp.buildPath("api/addSession"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  axios(config).then(function (response) {

    var res = response.data;

    if (res.error) {
      console.log("Not sure that this would be possible")
      
    } else {

      var newId = res.sessionId;
      console.log(newId);
    }

  }).catch(function (error) {
    console.log(error);
  });
}

export default NewSession;