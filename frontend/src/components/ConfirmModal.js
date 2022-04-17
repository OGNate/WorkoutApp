import React from "react";
import {
  Button, Modal
} from "react-bootstrap";

function ConfirmModal(props) {

  return (

    <Modal show={props.show} onHide={props.handleClose}>

    <Modal.Header closeButton>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
    
    <Modal.Body>

    </Modal.Body>
    
    <Modal.Footer>

      <Button variant="secondary" onClick={props.handleClose}>
        Discard
      </Button>

      <Button variant="primary" onClick={props.userConfirm}>
        Save Changes
      </Button>

    </Modal.Footer>
  
  </Modal>
  );
}

export default ConfirmModal;