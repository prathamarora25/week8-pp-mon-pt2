import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages & components
import Home from "./pages/HomePage";
import AddWorkoutPage from "./pages/AddWorkoutPage";
import WorkoutPage from "./pages/WorkoutPage";
import EditWorkoutPage from "./pages/EditWorkoutPage";
import Navbar from "./components/Navbar";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="content">
          <Routes>
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Home />} />
            <Route path="/add-workout" element={<AddWorkoutPage />} />
            <Route path="/workouts/:id" element={<WorkoutPage />} />
            <Route path="/edit-workout/:id" element={<EditWorkoutPage />} />
	    <Route path="/signup" element={<SignupPage />} />
	    <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
