import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Container, Modal } from "react-bootstrap";
import { Link, Outlet, useParams } from "react-router-dom";
import Excercises from "../components/exercises/Exercises";
import tokenStorage from '../tokenStorage';

function finishWorkout() {

  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState([]);

  var obj = {
    "sessionID": sessionId,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var bp = require("../utils/Path.js");
  var js = JSON.stringify(obj);

  //var config = bp.apiCall("api/finishWorkout", js);
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

          <Button variant="primary">Finish</Button>

          <p>Timer</p>
          <p>Notes</p>

          <Button variant="primary" onClick={handleShow}>Add Exercises</Button>

          <Modal show={show} onHide={handleClose}>

            <Modal.Header closeButton>
              <Modal.Title>Add Exercises</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Excercises inSession={true} />
            </Modal.Body>

            </Modal>

        </Card>

        <Link to="/workout">Back to Workout Page</Link>
      </Container>

      <Outlet />
    </>
  )
}

export default ActiveSessionPage;