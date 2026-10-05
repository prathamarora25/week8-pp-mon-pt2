import { useNavigate } from "react-router-dom";

const WorkoutListing = ({ workout }) => {
  const navigate = useNavigate();

  return (
    <div
      className="workout-preview"
      onClick={() => navigate(`/workouts/${workout._id}`)}
      style={{ cursor: "pointer" }}
    >
      <h2>{workout.title}</h2>
      <p>Difficulty: {workout.difficulty}</p>
      <p>{workout.description}</p>
      <p>Price: ${workout.price}</p>
    </div>
  );
};

export default WorkoutListing;
