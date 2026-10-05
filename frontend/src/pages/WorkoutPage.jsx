import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

const WorkoutPage  = () => {
  const {id}=useParams();
  const navigate = useNavigate();

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
      });

      if (!response.ok) {
        throw new Error("Failed to delete workout");
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
      <button onClick={() => navigate(`/edit-workout/${id}`)}>
        Edit
      </button>
      <button onClick={deleteWorkout}>Delete</button>
    </div>
  );
};

export default WorkoutPage;
