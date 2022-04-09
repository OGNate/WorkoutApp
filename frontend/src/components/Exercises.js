import axios from "axios";
import React, { useState } from "react";
import tokenStorage from '../tokenStorage';

function Exercises() {

  const [exercises2, setExercises2] = useState();
  const [response, setResponse] = useState("");

  var bp = require("./Path.js");

  var obj = {
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var config = {
    
    method: "POST",
    url: bp.buildPath("api/displayAllWorkouts"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  axios(config).then(function (response) {

    var res = response.data;
    setResponse(JSON.stringify(res));
    setExercises2(res.results);

  }).catch(function (error) {
    console.log(error);
  });

  return (
    <p>{response}</p>
  );
};

export default Exercises;