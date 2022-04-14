import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, Dropdown, ListGroup } from "react-bootstrap";
import tokenStorage from '../../tokenStorage';
import ExerciseCard from "./ExerciseCard";

function Exercises({inSession}) {

  const [bodyPartFilter, setBodyPartFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');

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

  const exercisesToShow = exercises
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((exercise) => {

        if (bodyPartFilter) {
          return exercise.bodyType === bodyPartFilter;
        }

        if (equipmentFilter) {
          return exercise.equipment === equipmentFilter;
        }

      return true;
    })
    .map((item, i) => {
        return <li key={i}>{item.name}</li>;
  });

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

  return (

    <>
      <Dropdown items={['Tea', 'Juice']} />
      
      <div>
        <Dropdown items={bodyParts} setSelected={setBodyPartFilter} />
        <Dropdown items={equipment} setSelected={setEquipmentFilter} />
        <ol>{exercisesToShow}</ol>
      </div>

      <Card style={{ width: '18rem' }}>

        <ListGroup variant="flush">

          {
            exercises.map(exercise => (<ExerciseCard exercise={exercise} session={inSession} />))
          }
          
        </ListGroup>
      </Card>
    </>
  );
};

export default Exercises;