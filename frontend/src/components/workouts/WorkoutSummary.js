import React from "react";
import { useParams } from "react-router-dom";

function WorkoutSummary() {

  const { sessionId } = useParams();

  var bp = require("../../utils/Path.js");

  // var obj = {
  //   "jwtToken": tokenStorage.retrieveToken()
  // };

  // var js = JSON.stringify(obj);

  // var config = bp.apiCall("api/finish", js);

  // useEffect(() => {
      
  //   axios(config).then(function (response) {

  //     var res = response.data;

  //   }).catch(function (error) {
  //     console.log(error);
  //   });

  // }, []);

  return (
    <h1>{sessionId}</h1>
  );
}

export default WorkoutSummary;