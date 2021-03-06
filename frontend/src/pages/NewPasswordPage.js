import axios from "axios";
import React, { useState } from "react";
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from "react-router";
import { Outlet, useParams } from "react-router-dom";

function NewPasswordPage() {

  const { userID, passwordResetToken } = useParams();

  // Redirect after login
  const navigate = useNavigate();
  const location = useLocation();

  // Incorrect password or any other error
  const [setErrorMessage] = useState("");

  var bp = require("../utils/Path.js");

  var newPW, confirmNewPW;

  const attemptResetPassword = async (event) => {
    
    event.preventDefault();
  
    var js = JSON.stringify({
      "userID": userID,
      "passwordResetToken": passwordResetToken,
      "newPassword": newPW
    });

    var config = bp.apiCall("api/passwordReset", js);

    axios(config).then(function (response) {

      var res = response.data.ret;

      if (res.error) {

        setErrorMessage(res.error);
        
      } else {
        navigate("/login");
      }

    }).catch(function (error) {
      console.log(error);
    });
  };

  return (

    <>
      <Form onSubmit={attemptResetPassword}>

        <h3>Reset Password</h3>

        <Form.Group className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" placeholder="Enter new password" ref={(c) => newPW = c} />
        </Form.Group>

        <Form.Group className="mb-3">
          <label>Confirm Password</label>
          <input type="password" className="form-control" placeholder="Confirm new password"ref={(c) => confirmNewPW = c} />
        </Form.Group>

        <Button variant="primary" type="submit" className="btn btn-primary btn-block">
          Submit
        </Button>
      </Form>

      <Outlet />
    </>
  );
}

export default NewPasswordPage;