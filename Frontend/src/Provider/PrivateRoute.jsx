import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../Provider/UserContext';

const PrivateRoute = () => {
  const { token } = useContext(UserContext);

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
