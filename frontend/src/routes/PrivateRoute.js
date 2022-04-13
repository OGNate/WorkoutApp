import React from "react";
import {
  Navigate,
  Outlet
} from 'react-router-dom';
import { isLoggedIn } from "../tokenStorage";

const PrivateRoute = ({
  
  redirectPath = '/login',
  children

}) => {
  
  if (!isLoggedIn()) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;