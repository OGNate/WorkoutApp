import React from 'react';
import { Dropdown } from 'react-bootstrap';

const DropdownTest = (props) => {
  
  return (
    <Dropdown>
      <Dropdown.Toggle variant="primary" id="dropdown-basic">
        {props.name}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {props.items.map((name, index) => (
            <Dropdown.Item
                key={index}
                onClick={(event) => {
                  props.setSelected(event.target.text);
                }}
                value={name}
            >
                {name}
            </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownTest;