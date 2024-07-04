import React from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";

function RouterProvider(props) {
  const { children, ...path } = props;

  // Get the navigate and location functions from the react-router-dom library
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch(path);

  // You can perform any common logic here before rendering children

  // Pass navigate, location, and dispatch as props to the children
  return React.cloneElement(children, { navigate, location, match });
}

export default RouterProvider;
