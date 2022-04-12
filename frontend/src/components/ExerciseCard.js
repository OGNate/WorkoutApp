import React from 'react';
import { ListGroup } from "react-bootstrap";

function ExerciseCard({ exercise }) {
  
    return (
        <ListGroup.Item>
          {exercise.name} - {exercise.workoutType}
        </ListGroup.Item>
    )
}

export default ExerciseCard;