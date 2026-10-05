import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddWorkoutPage = () => {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();

    const workout = {
      title,
      difficulty,
      description,
      price: Number(price),
    };

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workout),
      });

      if (!response.ok) {
        throw new Error("Failed to add workout");
      }

      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="create">
      <h2>Add a New Workout</h2>

      <form onSubmit={submitForm}>
        <label>Title:</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <label>Description:</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button>Add Workout</button>

        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default AddWorkoutPage;