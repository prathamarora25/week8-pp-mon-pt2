import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditWorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState({
    title: "",
    difficulty: "",
    description: "",
    price: "",
  });

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

        setWorkout({
          title: data.title,
          difficulty: data.difficulty,
          description: data.description,
          price: data.price,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const handleChange = (event) => {
    setWorkout({
      ...workout,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: workout.title,
          difficulty: workout.difficulty,
          description: workout.description,
          price: Number(workout.price),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update workout");
      }

      navigate(`/workouts/${id}`);
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
    <div className="create">
      <h2>Update Workout</h2>

      <form onSubmit={handleSubmit}>
        <label>Workout title:</label>
        <input
          type="text"
          name="title"
          value={workout.title}
          onChange={handleChange}
          required
        />

        <label>Difficulty:</label>
        <input
          type="text"
          name="difficulty"
          value={workout.difficulty}
          onChange={handleChange}
          required
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={workout.description}
          onChange={handleChange}
          required
        />

        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={workout.price}
          onChange={handleChange}
          required
        />

        <button type="submit">Update Workout</button>
      </form>
    </div>
  );
};

export default EditWorkoutPage;
