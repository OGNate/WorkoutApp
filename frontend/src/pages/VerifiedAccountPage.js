import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VerifiedAccountPage = () => {

  const { userID, uniqueEmailToken } = useParams();

  var bp = require("../utils/Path.js");

  useEffect(() => {
    bp.apiGetCall("api/emailVerification/" + userID + "/" + uniqueEmailToken);
  }, []);

  return (
    <p>Congrats, you're verified!</p>
  );
};

export default VerifiedAccountPage;