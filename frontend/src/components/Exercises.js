import axios from "axios";
import React, { useState } from "react";

function Exercises() {

  const [exercises, setExercises] = useState();

  var bp = require("./Path.js");

  var obj = {
    "query": ""
  };

  var js = JSON.stringify(obj);

  var config = {
    
    method: "POST",
    url: bp.buildPath("api/searchWorkout"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  axios(config).then(function (response) {

    var res = response.data;

    setExercises(res.results);

  }).catch(function (error) {
    console.log(error);
  });

  return (
    <div className="col">
      <h1>Mi Casa</h1>
      {exercises.map(exercise => <div>{exercise.name}</div>)}
    </div>
  );
};

export default Exercises;