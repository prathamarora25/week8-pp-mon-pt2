import {useEffect, useState} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import { getUser, logoutUser } from '../utils/auth';

const WorkoutPage  = () => {
  const {id}=useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch workout");
        }

        const data = await response.json();
        setWorkout(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const deleteWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      // token expired / invalid / user deleted -> log out and go to login
      if (response.status === 401) {
        logoutUser();
        navigate("/login");
        return;
      }

      // 204 No Content has no body, so only read JSON on errors
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete workout");
      }

      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return <p>Loading workout...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="workout-preview">
      <h2>{workout.title}</h2>
      <p>Difficulty: {workout.difficulty}</p>
      <p>{workout.description}</p>
      <p>Price: ${workout.price}</p>

      {user ? (
        <>
          <button onClick={() => navigate(`/edit-workout/${id}`)}>
            Edit
          </button>
          <button onClick={deleteWorkout}>Delete</button>
        </>
      ) : (
        <p>
          <Link to="/login">Log in</Link> to edit or delete this workout.
        </p>
      )}
    </div>
  );
};

export default WorkoutPage;
