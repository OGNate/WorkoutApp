import React, { Component }  from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  return (

    <div>

      <form>

        <label> Name:
          <input type="text" name="name" />
        </label>

        <input type="submit" value="Submit" />

      </form>

    </div>
  );
}

export default App;
