import React from 'react';
import { Dropdown } from 'react-bootstrap';

const Dropdown = (props) => {
  return (
      <Dropdown>
        <Dropdown.Toggle variant='success' id='dropdown'>
            <span>Selection</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
            {props.items.map((name, index) => (
                <Dropdown.Item
                    key={index}
                    onClick={(event) => {
                        console.log(event.target.text);
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