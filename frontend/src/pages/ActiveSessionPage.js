import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Container, Modal } from "react-bootstrap";
import { Outlet, useParams } from "react-router-dom";
import Excercises from "../components/exercises/Exercises";
import tokenStorage from '../tokenStorage';

function addToSession(userID, sessionId, exercises) {

  exercises.forEach(exercise => {

    var obj = {
      "userID": userID,
      "sessionId": sessionId,
      "workoutName": exercise.name,
      "jwtToken": tokenStorage.retrieveToken()
    };

    var bp = require("../utils/Path.js");
    var js = JSON.stringify(obj);

    var finishWorkoutConfig = bp.apiCall("api/finishSession", js);

    axios(finishWorkoutConfig).then(function () {

    }).catch(function (error) {
      console.log(error);
    });
  });
}

function finishSession(sessionId) {

  var obj = {
    "sessionId": sessionId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var bp = require("../utils/Path.js");
  var js = JSON.stringify(obj);

  var finishWorkoutConfig = bp.apiCall("api/finishSession", js);

  axios(finishWorkoutConfig).then(function () {

    window.location.href = "/workout/" + sessionId + "/summary";

  }).catch(function (error) {
    console.log(error);
  });
}

function ActiveSessionPage() {

  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState([]);

  var obj = {
    "sessionID": sessionId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var bp = require("../utils/Path.js");
  var js = JSON.stringify(obj);

  var sessionDetailsConfig = bp.apiCall("api/getAllWorkoutDetails", js);

  useEffect(() => {
      
    axios(sessionDetailsConfig).then(function (response) {

      var res = response.data;
      setSessionDetails(res.session);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Container>
        <Card>
          
          <h3>Session ID: {sessionId}</h3>
          <h3>{sessionDetails.sessionName}</h3>

          <Button variant="secondary">Cancel</Button>

          <Button 
            variant="primary"
            onClick={() => finishSession(sessionId)}
          >
              Finish
          </Button>

          <p>Timer</p>
          <p>Notes</p>

          <Button variant="primary" onClick={handleShow}>Add Exercises</Button>

          <Modal show={show} onHide={handleClose}>

            <Modal.Header closeButton>
              <Modal.Title>Add Exercises</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Excercises onNextAction={addToSession} />
            </Modal.Body>

            </Modal>

        </Card>
      </Container>

      <Outlet />
    </>
  )
}

export default ActiveSessionPage;