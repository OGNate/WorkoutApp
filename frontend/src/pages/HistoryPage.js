import axios from "axios";
import { default as React, useEffect, useState } from 'react';
import { Card, ListGroup } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import GlobalNavigation from '../components/GlobalNavigation';
import WorkoutCard from "../components/workouts/WorkoutCard";
import tokenStorage from '../tokenStorage';

const HistoryPage = () => {

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [sessions, setSessions] = useState([]);

  var bp = require("../utils/Path.js");

  var obj = {
    "userID": ud.userId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var config = bp.apiCall("api/displaySessions", js);

  useEffect(() => {
      
    axios(config).then(function (response) {

      var res = response.data;
      setSessions(res.sessions);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  sessions.map((session) => {
    console.log(session);
    return <WorkoutCard session={session} />
  });

  return (

    <Container>

      <GlobalNavigation />

      <h1>History</h1>

      <Card style={{ width: '18rem' }}>
        <ListGroup variant="flush">
          {
            sessions.map((session) => <WorkoutCard session={session} />)
          }
        </ListGroup>
      </Card>
      
    </Container>
  );
};

export default HistoryPage;
