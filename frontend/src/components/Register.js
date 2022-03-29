import React, { useState } from "react";
import axios from "axios";

function Register() {

  var bp = require("./Path.js");
  // var storage = require("../tokenStorage.js");

  var newFirstName, newLastName, newEmail, newPassword;

  const [message, setMessage] = useState("");

  const attemptRegistration = async (event) => {

    event.preventDefault();

    var obj = {
      firstName: newFirstName.value,
      lastName: newLastName.value,
      email: newEmail.value,
      password: newPassword.value,
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

        window.location.href = "/verify-account";
      }

    }).catch(function (error) {
      console.log(error);
    });
  };

  return (

    <div id="registerDiv">

      <form onSubmit={attemptRegistration}>

        <input type="text" id="newFirstName" placeholder="First Name" ref={(c) => newFirstName = c}  /><br />
        <input type="text" id="newLastName" placeholder="Last Name" ref={(c) => newLastName = c}  /><br />

        <input type="text" id="newEmail" placeholder="Email Address" ref={(c) => newEmail = c}  /><br />
        <input type="password" id="newPassword" placeholder="Password" ref={(c) => newPassword = c} /><br />

        <input type="submit" id="registerButton" value = "Login" onClick={attemptRegistration} />

        <span id="loginResult">{message}</span>

      </form>

      <span>Already have an account? <a href="/">Login instead</a>.</span>

   </div>
  );
};

export default Register;