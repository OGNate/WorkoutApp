import axios from "axios";
import React, { useState } from "react";
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from "react-router";

function PasswordReset() {

  // Redirect after login
  const navigate = useNavigate();
  const location = useLocation();

  // Incorrect password or any other error
  const [setErrorMessage] = useState("");

  var bp = require("../../utils/Path.js");
  var storage = require("../../tokenStorage.js");

  var recoveryEmail;

  const attemptRecovery = async (event) => {
    
    event.preventDefault();

    var obj = {
      email: recoveryEmail.value
    };

    var js = JSON.stringify(obj);
    var config = bp.apiCall("api/requestPasswordReset", js);

    axios(config).then(function (response) {

      var res = response.data;

      if (res.error) {

        setErrorMessage(res.error);
        
      } else {
        navigate("/resetPassword");
      }
    });
  }

  return (

    <>
      <Form onSubmit={attemptRecovery}>

        <h3>Forgot Password</h3>

        <Form.Group className="mb-3">
          <label>Email address</label>
          <input type="email" className="form-control" placeholder="Enter email" ref={(c) => recoveryEmail = c} />
        </Form.Group>

        <Button variant="primary" type="submit" className="btn btn-primary btn-block">
          Submit
        </Button>

      </Form>
    </>
  );
}

export default PasswordReset;