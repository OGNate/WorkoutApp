import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import tokenStorage from '../tokenStorage';
import ExerciseCard from "./ExerciseCard";

function UserHistory() {

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [history, setHistory] = useState([]);

  var bp = require("./Path.js");

  var obj = {
    "userID": ud.userId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var config = {
    
    method: "POST",
    url: bp.buildPath("api/displayUserHistory"),

    headers: {
      "Content-Type": "application/json",
    },

    data: js,
  };

  useEffect(() => {
      
    axios(config).then(function (response) {

    var res = response.data;
    setHistory(res.results);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  return (
    <Card style={{ width: '18rem' }}>
      <ListGroup variant="flush">
        {
          history.map(exercise => (<ExerciseCard exercise={exercise}/>))
        }
        
      </ListGroup>
    </Card>
  );
};

export default UserHistory;