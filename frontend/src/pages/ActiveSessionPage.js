import React from "react";
import { Button, Card, Container } from "react-bootstrap";
import { Link, useParams } from 'react-router-dom';

function ActiveSessionPage() {

  const { sessionId } = useParams();

  return (
    <>
      <Container>
        <Card>
          
          <h1>Session ID: {sessionId}</h1>
          <h1>Session Name</h1>

          <Button variant="secondary">Finish</Button>
          <Button variant="primary">Finish</Button>

          <h3>Timer</h3>
          <h3>Notes</h3>
        </Card>

        <Link to="/workout">Back to Workout Page</Link>
      </Container>
    </>
  )
}

export default ActiveSessionPage;