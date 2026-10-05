import { Link, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h1>Workout</h1>

      <div className="links">
        <Link to="/">Home</Link>
        {user && <Link to="/add-workout">Add Workout</Link>}

        {user ? (
          <>
            <span>
              {user.username} ({user.role})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
