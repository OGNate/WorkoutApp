import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import tokenStorage from '../../tokenStorage';
import ExerciseCard from "./ExerciseCard";
import DropdownTest from "./filter/DropdownTest";

function Exercises({inSession}) {

  const [exercises, setExercises] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [equipment, setEquipment] = useState([]);

  var bp = require("../../utils/Path.js");

  var obj = {
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var allWorkoutsConfig = bp.apiCall("api/displayAllWorkouts", js);
  var allBodyPartsConfig = bp.apiCall("api/displayAllBodyParts", js);
  var allEquipmentConfig = bp.apiCall("api/displayAllEquipment", js);

  useEffect(() => {
      
    axios(allWorkoutsConfig).then(function (response) {

      var res = response.data;
      setExercises(res.results);

    }).catch(function (error) {
      console.log(error);
    });

    axios(allBodyPartsConfig).then(function (response) {

      var res = response.data;
      setBodyParts(res.results);
  
    }).catch(function (error) {
      console.log(error);
    });

    axios(allEquipmentConfig).then(function (response) {

      var res = response.data;
      setEquipment(res.results);
  
    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  const [bodyPartFilter, setBodyPartFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('');

  const exercisesToShow = exercises
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((exercise) => {

      var shouldShow = true;

        if (bodyPartFilter) {
          var bodyParts = exercise.bodyPart;
          shouldShow = bodyParts.includes(bodyPartFilter);
        }

        if (equipmentFilter) {
          var equipmentTypes = exercise.equipment;
          shouldShow = shouldShow && equipmentTypes.includes(equipmentFilter);
        }

        return shouldShow;
      
    }).map((exercise) => {
      return <ExerciseCard exercise={exercise} session={inSession} />
    });


  return (

    <>
      <DropdownTest name="Body Part" items={bodyParts} setSelected={setBodyPartFilter} />
      <DropdownTest name="Equipment Type" items={equipment} setSelected={setEquipmentFilter} />

      <input type="text" placeholder="Search" ref={(c) => setExerciseFilter(c) } />

      <p>Results: {exercisesToShow.length} ({(exercises.length - exercisesToShow.length)} filtered)</p>

      <Card style={{ width: '18rem' }}>
        <ListGroup variant="flush">
          {
            exercisesToShow
          }
        </ListGroup>
      </Card>
    </>
  );
};

export default Exercises;