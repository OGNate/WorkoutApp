import React, { useState } from "react";
import {
  Button, Modal
} from "react-bootstrap";

function Templates() {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <h2>Templates</h2>

      <h3>My Templates</h3>

      <Button variant="primary" onClick={handleShow}>New Template</Button>
      
      <Modal show={show} onHide={handleClose}>

        <Modal.Header closeButton>
          <Modal.Title>New Template</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>

        </Modal.Body>
        
        <Modal.Footer>

          <Button variant="secondary" onClick={handleClose}>
            Discard
          </Button>

          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>

        </Modal.Footer>
      
      </Modal>
    </>
  );
};

export default Templates;