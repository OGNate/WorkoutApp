import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";

function LoginAlert(message) {

  const [show, setShow] = useState(true);

  if (show) {
    
    return (
      <Alert variant="danger" onClose={() => setShow(false)} dismissible>
        {message}
      </Alert>
    );
  }

  return (null);
}

export default LoginAlert;