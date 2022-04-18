import axios from "axios";
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VerifiedAccountPage = () => {

  const { userID, uniqueEmailToken } = useParams();

  var bp = require("../utils/Path.js");

  var obj = {
    userID: userID,
    uniqueEmailToken: uniqueEmailToken
  };

  var config = bp.apiCall("api/emailVerification/" + userID + "/" + uniqueEmailToken, obj);

  useEffect(() => {

    axios(config).then(function (response) {

      console.log("1");

      var res = response.data;

      console.log("2");

      if (res.error) {

        console.log("3");

        return (
          <h1>Invalid user or email token!</h1>
        );
        
      } else {
        console.log("4");
      }
  
      }).catch(function (error) {
        console.log(error);
      });

  }, []);

  return (
    <p>Congrats, you're verified!</p>
  );
};

export default VerifiedAccountPage;