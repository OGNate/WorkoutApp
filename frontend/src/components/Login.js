import React, { useState } from "react";
import axios from "axios";

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

    <div id="loginDiv">

      <form onSubmit={attemptLogin}>

        <input type="text" id="loginName" placeholder="Username" ref={(c) => loginEmail = c}  /><br />
        <input type="password" id="loginPassword" placeholder="Password" ref={(c) => loginPassword = c} /><br />

        <input type="submit" id="loginButton" class="buttons" value = "Login" onClick={attemptLogin} />

        <span id="loginResult">{message}</span>

      </form>

   </div>
  );
};

export default Login;