import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Redirect } from 'react-router';

function Register() {

  var bp = require("./Path.js");
  var storage = require("../tokenStorage.js");

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

        var jwt = require("jsonwebtoken");

        this.context.router.push({
          pathname: '/verify-account',
          state: {email: "thomashanson@gmail.com"}  
        });
      }

    }).catch(function (error) {
      console.log(error);
    });

    return (
      <Redirect to={{
        pathname: '/verify-account',
        state: { email: '123' }
      }}/>);
  };

  return (

    <Form onSubmit={attemptRegistration}>

      <Form.Group className="mb-3" controlId="formName">

        <Form.Label>First Name</Form.Label>

        <Form.Control
          required
          type="text" 
          placeholder="John" 
          ref={(c) => newFirstName = c} 
        />
        
        <Form.Label>Last Name</Form.Label>
        <Form.Control type="text" placeholder="Doe" ref={(c) => newLastName = c} />
      
      </Form.Group>

      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email Address</Form.Label>
        <Form.Control type="email" placeholder="Email address" ref={(c) => newEmail = c} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPassword">

        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" ref={(c) => newPassword = c} />
        
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control type="password" placeholder="Confirm password" ref={(c) => newPassword2 = c} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Register
      </Button>

    </Form>
  );
};

export default Register;