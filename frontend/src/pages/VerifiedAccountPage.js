import axios from "axios";
import React from 'react';
import { useParams } from 'react-router-dom';
import GlobalNavigation from '../components/GlobalNavigation';

const VerifiedAccountPage = () => {

  const { userID, uniqueEmailToken } = useParams();

  var bp = require("../utils/Path.js");

  var config = bp.apiCall("api/emailVerification", {}, "GET");

  axios(config).then(function (response) {

    var res = response.data;

    if (res.error) {

      return (
        <h1>Invalid user or email token!</h1>
      );
      
    } else {
      
      return (

        <div>
          <GlobalNavigation />
          <p>Account confirmed!</p>
        </div>
      );
    }

  }).catch(function (error) {
    console.log(error);
  });
};

export default VerifiedAccountPage;