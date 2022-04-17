import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import tokenStorage from '../tokenStorage';
import ExerciseCard from "./ExerciseCard";

function UserHistory() {

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [history, setHistory] = useState([]);

  var bp = require("../utils/Path.js");

  var obj = {
    "userID": ud.userId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);
  var config = bp.apiCall("api/displayUserHistory", js);

  useEffect(() => {
      
    axios(config).then(function (response) {

    var res = response.data;
    setHistory(res.results);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  return (
    
    <Card style={{ cursor: "pointer" }}>
      <ListGroup variant="flush">
        {
          history.map(exercise => (<ExerciseCard exercise={exercise}/>))
        }
        
      </ListGroup>
    </Card>
  );
};

export default UserHistory;