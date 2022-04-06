import axios from "axios";
import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function Login() {

  var bp = require("./Path.js");
  // var storage = require("../tokenStorage.js");

  var loginEmail, loginPassword;

  const [message, setMessage] = useState("");

  const attemptLogin = async (event) => {
    
    event.preventDefault();

    var obj = {
      email: loginEmail.value,
      password: loginPassword.value,
    };

    var js = JSON.stringify(obj);

    var config = {
      
      method: "POST",
      url: bp.buildPath("api/login"),

      headers: {
        "Content-Type": "application/json",
      },

      data: js,
    };

    axios(config).then(function (response) {

      var res = response.data;

      if (res.error) {
        setMessage("Invalid email or password");
        
      } else {

        // storage.storeToken(res);
        // var jwt = require("jsonwebtoken");

        // var ud = jwt.decode(storage.retrieveToken(), { 
        //   complete: true 
        // });

        // var userId = ud.payload.userId;
        // var firstName = ud.payload.firstName;
        // var lastName = ud.payload.lastName;

        // var user = { 
        //   firstName: firstName, 
        //   lastName: lastName, 
        //   id: userId 
        // };

        // localStorage.setItem("user_data", JSON.stringify(user));

        window.location.href = "/dashboard";
      }

    }).catch(function (error) {
      console.log(error);
    });
  };

  return (

    <Form onSubmit={attemptLogin}>

      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Email address" ref={(c) => loginEmail = c} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" ref={(c) => loginPassword = c} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Login
      </Button>

    </Form>
  );
};

export default Login;