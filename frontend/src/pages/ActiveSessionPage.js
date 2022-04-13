import React, { useState } from "react";
import { Button, Card, Container, Modal } from "react-bootstrap";
import { Link, useParams } from 'react-router-dom';
import Excercises from "../components/Exercises";

function ActiveSessionPage() {

  const { sessionId } = useParams();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Container>
        <Card>
          
          <h3>Session ID: {sessionId}</h3>
          <h3>Session Name</h3>

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
              <Excercises />
            </Modal.Body>

            </Modal>

        </Card>

        <Link to="/workout">Back to Workout Page</Link>
      </Container>
    </>
  )
}

export default ActiveSessionPage;