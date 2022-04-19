import React from 'react';
import { Button, Card, ListGroup } from "react-bootstrap";
import Checkbox from './Checkbox';

class CheckboxContainer extends React.Component {
  
  constructor(props) {
    
    super(props);

    this.state = {
      checkedItems: new Map(),
    }

    this.onNextAction = this.onNextAction.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  onNextAction(exercises) {
    console.log(exercises);
  }

  handleChange(e) {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
  }

  render() {
    
    return (
      
      <React.Fragment>

        <Button
          onClick={() => this.onNextAction}
        >
          Add to Session
        </Button>
        
        {
          this.props.exercises.map(exercise => (
            <>
              <ListGroup.Item>

                <Card.Title>{exercise.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{exercise.workoutType}</Card.Subtitle>
                
                <Checkbox 
                  key={exercise}
                  name={exercise.name}
                  checked={this.state.checkedItems.get(exercise.name)} 
                  onChange={this.handleChange} 
                />

              </ListGroup.Item>
            </>
          ))
        }
      </React.Fragment>
    );
  }
}

export default CheckboxContainer;