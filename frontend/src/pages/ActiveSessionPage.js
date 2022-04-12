import React from "react";
import ActiveSession from "../components/ActiveSession";

function ActiveSessionPage() {

  return(
    <>
      <h1>{this.props.sessionId}</h1>
      <ActiveSession />
    </>
  )
}

export default ActiveSessionPage;