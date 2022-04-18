import React, { useState } from 'react';
import { Card, ListGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";

function ExerciseCard({ exercise, inSession }) {

  const [isChecked, setChecked] = useState(false);
  
  return (
    <>
      <ListGroup.Item
        onClick={ () => setChecked(!isChecked) }
      >
        
        <Card.Title>{exercise.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{exercise.workoutType}</Card.Subtitle>

        <Form.Check 
          type="checkbox" 
          checked={isChecked}
          onChange={() => setChecked(!isChecked)}
        />
        
      </ListGroup.Item>
    </>
  )
}

export default ExerciseCard;