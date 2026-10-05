import { useEffect, useState } from "react";
import WorkoutListing from "./WorkoutListing";

const WorkoutListings = () => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch("/api/workouts");

        if (!response.ok) {
          throw new Error("Failed to fetch workouts");
        }

        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  if (isLoading) {
    return <p>Loading workouts...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (workouts.length === 0) {
    return <p>No workouts found.</p>;
  }

  return (
    <div className="workout-list">
      {workouts.map((workout) => (
        <WorkoutListing key={workout.id} workout={workout} />
      ))}
    </div>
  );
};

export default WorkoutListings;