import axios from "axios";
import { default as React, useEffect, useState } from 'react';
import Container from "react-bootstrap/Container";
import GlobalNavigation from '../components/GlobalNavigation';
import tokenStorage from '../tokenStorage';

const HistoryPage = () => {

  var _ud = localStorage.getItem('user_data');
  var ud = JSON.parse(_ud);

  const [sessions, setSessions] = useState([]);

  var bp = require("../utils/Path.js");

  var obj = {
    "userID": ud._id,
    "jwtToken": tokenStorage.retrieveToken()
  };

  var js = JSON.stringify(obj);

  var config = bp.apiCall("/api/displaySessions", js);

  useEffect(() => {
      
    axios(config).then(function (response) {

      var res = response.data;
      setSessions(res.results);

    }).catch(function (error) {
      console.log(error);
    });

  }, []);

  return (

    <Container>

      <GlobalNavigation />

      <h1>History</h1>

      <p>{sessions}</p>
      
    </Container>
  );
};

export default HistoryPage;
