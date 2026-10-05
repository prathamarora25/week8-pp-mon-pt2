const Workout = require('../models/workoutModel');
const mongoose = require('mongoose');

// GET /api/workouts
const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({});
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/workouts
const createWorkout = async (req, res) => {
  const { title, difficulty, description, price } = req.body;

  try {
    const workout = await Workout.create({
      title,
      difficulty,
      description,
      price,
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /api/workouts/:workoutId
 const getWorkoutById = async (req, res) => {
  const { workoutId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(workoutId)) {
    return res.status(400).json({ error: "Invalid workout ID" });
  }
  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }
    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/workouts/:workoutId
const updateWorkout = async (req, res) => {
  const { workoutId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workoutId)) {
    return res.status(400).json({ error: "Invalid workout ID" });
  }

  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: workoutId },
      { ...req.body },
      { returnDocument: "after", runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/workouts/:workoutId
const deleteWorkout = async (req, res) => {
  const { workoutId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workoutId)) {
    return res.status(400).json({ error: "Invalid workout ID" });
  }

  try {
    const workout = await Workout.findByIdAndDelete(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getAllWorkouts,
  createWorkout,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};

