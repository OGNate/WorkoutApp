import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import tokenStorage from '../tokenStorage';
import ExerciseCard from "./ExerciseCard";

function Exercises() {

  const [exercises, setExercises] = useState([]);

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

  useEffect(() => {
      
    axios(config).then(function (response) {

    var res = response.data;
    setExercises(res.results);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  return (
    <Card style={{ width: '18rem' }}>
      <ListGroup variant="flush">

        {
          exercises
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(exercise => (<ExerciseCard exercise={exercise}/>))
        }
        
      </ListGroup>
    </Card>
  );
};

export default Exercises;