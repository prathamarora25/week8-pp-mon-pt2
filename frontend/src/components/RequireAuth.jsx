import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

// Redirects visitors to /login if they are not logged in
const RequireAuth = ({ children }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
