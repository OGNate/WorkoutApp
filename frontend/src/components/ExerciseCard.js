import React from 'react';
import { Card, ListGroup } from "react-bootstrap";

function ExerciseCard({ exercise }) {
  
    return (
        <ListGroup.Item>
          <Card.Title>{exercise.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{exercise.workoutType}</Card.Subtitle>
        </ListGroup.Item>
    )
}

export default ExerciseCard;