import React from "react";
import { Link } from "react-router-dom";
import WorkoutSummary from "../components/workouts/WorkoutSummary";

function WorkoutSummaryPage() {

  return (
    <>
      <WorkoutSummary />
      <Link to="/history">Back to History Page</Link>
    </>
  );
}

export default WorkoutSummaryPage;