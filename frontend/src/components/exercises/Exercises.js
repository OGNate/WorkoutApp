import axios from "axios";
import React, { useEffect, useState } from "react";
import tokenStorage from '../../tokenStorage';
import CheckboxContainer from "../CheckboxContainer";
import DropdownTest from "./filter/DropdownTest";

const Exercises = (props) => {

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

          if (!shouldShow) {
            // The body part will get filtered - uncheck box
          }
        }

        if (equipmentFilter) {

          var equipmentTypes = exercise.equipment;
          shouldShow = shouldShow && equipmentTypes.includes(equipmentFilter);

          if (!shouldShow) {
            // The equipment type will get filtered - uncheck box
          }
        }

        return shouldShow;
      
    }).map((exercise) => {
      return exercise;
    });

  return (
    <>
      <div style={{display: 'inline-block'}}>
        <DropdownTest name="Body Part" items={bodyParts} setSelected={setBodyPartFilter} />
        <DropdownTest name="Equipment Type" items={equipment} setSelected={setEquipmentFilter} />
        <input type="text" placeholder="Search" ref={(c) => setExerciseFilter(c) } />
      </div>

      <p>Results: {exercisesToShow.length} ({(exercises.length - exercisesToShow.length)} filtered)</p>

      <CheckboxContainer exercises={exercisesToShow} onNextAction={props.onNextAction} />
    </>
  );
};

export default Exercises;