import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from "react-router";
import './Login.css';

const eye = <FontAwesomeIcon icon={faEye} />;

function Login() {

  // Redirect after login
  const navigate = useNavigate();
  const location = useLocation();
  
  // Password field shown/hidden
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  // Incorrect password or any other error
  const [setErrorMessage] = useState("");

  var bp = require("../../utils/Path.js");
  var storage = require("../../tokenStorage.js");

  var loginEmail, loginPassword;

  const attemptLogin = async (event) => {
    
    event.preventDefault();

    var obj = {
      email: loginEmail.value,
      password: loginPassword.value,
    };

    var js = JSON.stringify(obj);
    var config = bp.apiCall("api/login", js);

    axios(config).then(function (response) {

      var res = response.data.ret;

      if (res.error) {

        setErrorMessage(res.error);
        
      } else {

        storage.storeToken(res);
        var jwt = require("jsonwebtoken");

        var ud = jwt.decode(storage.retrieveToken(), { 
          complete: true 
        });

        var user = {
          firstName: ud.payload.firstName, 
          lastName: ud.payload.lastName,
          userId: res.id
        };

        localStorage.setItem("user_data", JSON.stringify(user));

        if (location.state && location.state.from) {
          navigate(location.state.from)
        } else {
          navigate("/home");
        }
      }

    }).catch(function (error) {
      console.log(error);
    });
  };

  return (

    <>
      <Form onSubmit={attemptLogin}>

        <h3>Sign In</h3>

        <Form.Group className="mb-3">
          <label>Email address</label>
          <input type="email" className="form-control" placeholder="Enter email" ref={(c) => loginEmail = c} />
        </Form.Group>

        <div className="passwordWrapper">

          <Form.Group className="mb-3">
            <label>Password</label>
            <input type={passwordShown ? "text" : "password"} className="form-control" placeholder="Enter password" ref={(c) => loginPassword = c} />
          </Form.Group>

          <i onClick={togglePasswordVisiblity}>{eye}</i>
        </div>

        <Button variant="primary" type="submit" className="btn btn-primary btn-block">
          Submit
        </Button>
        
        <p className="forgot-password text-right">
          <a href="forgot-password">Forgot password?</a>
        </p>
      </Form>

      <p className="no-account text-right">
        No account? <a href="register">Register</a>
      </p>
    </>
  );
};

export default Login;