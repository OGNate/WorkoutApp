import React from "react";
import { useParams } from "react-router-dom";

function WorkoutSummary() {

  const { sessionId } = useParams();

  var bp = require("../../utils/Path.js");

  return (
    <h1>{sessionId}</h1>
  );
}

export default WorkoutSummary;