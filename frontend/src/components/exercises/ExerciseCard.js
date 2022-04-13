import React from 'react';
import { Card, Form, ListGroup } from "react-bootstrap";

function ExerciseCard({ exercise, inSession }) {
  
    return (
      <>
        <ListGroup.Item>
          
          <Card.Title>{exercise.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{exercise.workoutType}</Card.Subtitle>

          {
            inSession && <Form.Check type="Checkbox" />
          }
          
        </ListGroup.Item>
      </>
    )
}

export default ExerciseCard;