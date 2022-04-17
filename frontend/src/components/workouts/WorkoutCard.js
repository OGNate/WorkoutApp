import React from 'react';
import { Card, ListGroup } from "react-bootstrap";

function WorkoutCard({ session }) {

  //const DateTime = luxon.DateTime;

  const isoDate = session.updatedAt;
  //const newDate = DateTime.toLocaleString(DateTime.DATETIME_FULL);
  
    return (
      <>
        <ListGroup.Item>
          
          <Card.Title>{session.sessionName}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{isoDate}</Card.Subtitle>

            {
              session.workouts.map(workout => <p>{workout.name}</p>)
            }

        </ListGroup.Item>
      </>
    )
}

export default WorkoutCard;