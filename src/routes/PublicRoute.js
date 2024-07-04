import React from "react";
import Auth from "./Auth";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { is_new_user, envremoteConfig } = useSelector((state) => state);
  const isAllowed = Auth.isAuthenticated();

  if (envremoteConfig.isMaintenance === 1) {
    return (
      <>
        <Navigate to="/maintenance" />
        <Outlet />
      </>
    );
  } else if (isAllowed && !is_new_user) {
    return <Navigate to="/home-feed" />;
  } else {
    return <Outlet />;
  }
};

export default PublicRoute;
