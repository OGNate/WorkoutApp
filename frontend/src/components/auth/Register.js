import axios from "axios";
import React, { useState } from "react";
import Form from "react-bootstrap/Form";

function Register() {

  var bp = require("../Path.js");

  var newFirstName, newLastName, newEmail, newPassword, newPassword2;

  const [setMessage] = useState("");

  const attemptRegistration = async (event) => {

    event.preventDefault();

    var obj = {
      firstName: newFirstName.value,
      lastName: newLastName.value,
      email: newEmail.value,
      password: newPassword.value,
      password2: newPassword2.value,
    };

    var js = JSON.stringify(obj);

    var config = {
      
      method: "POST",
      url: bp.buildPath("api/register"),

      headers: {
        "Content-Type": "application/json",
      },

      data: js,
    };

    axios(config).then(function (response) {

      var res = response.data;

      if (res.error) {
        setMessage("Account already exists under given email");
        
      } else {

        window.location.href = "/verify-account";
      }

    }).catch(function (error) {
      console.log(error);
    });
  };

    return (

        <Form onSubmit={attemptRegistration}>

            <h3>Register</h3>

            <Form.Group className="mb-3">
                <label>First name</label>
                <input type="text" className="form-control" placeholder="First name" ref={(c) => newFirstName = c} />
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Last name</label>
                <input type="text" className="form-control" placeholder="Last name" ref={(c) => newLastName = c} />
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Email address</label>
                <input type="email" className="form-control" placeholder="Enter email" ref={(c) => newEmail = c} />
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Password</label>
                <input type="password" className="form-control" placeholder="Enter password" ref={(c) => newPassword = c} />
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Confirm Password</label>
                <input type="password" className="form-control" placeholder="Confirm password"ref={(c) => newPassword2 = c} />
            </Form.Group>

            <button type="submit" className="btn btn-primary btn-block">Sign Up</button>

            <p className="forgot-password text-right">
                Already registered? <a href="login">Sign in</a>
            </p>
        </Form>
    );
}

export default Register;