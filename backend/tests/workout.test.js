const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const connectDB = require("../config/db");
const Workout = require("../models/workoutModel");
const User = require("../models/userModel");
const { SECRET } = require("../utils/config");

const api = request(app);

const testUser = {
    username: "workout_test_user",
    password: "Test1234!",
    phoneNumber: "0401234567",
    name: "Workout Test User",
    role: "user",
};

const seedWorkouts = [
    {
        title: "Upper Body Blast",
        difficulty: "Beginner",
        description: "Upper body strength workout",
        price: 25,
    },
    {
        title: "Full Body Power",
        difficulty: "Intermediate",
        description: "Full body strength and cardio workout",
        price: 35,
    },
];

const workoutsInDb = async () => {
    const workouts = await Workout.find({});
    return workouts.map((workout) => workout.toJSON());
};

let token;

beforeAll(async () => {
    await connectDB();

    await User.deleteMany({});
    await Workout.deleteMany({});

    const signupResponse = await api
        .post("/api/users/signup")
        .send(testUser)
        .expect(201);

    token = signupResponse.body.token;
});

beforeEach(async () => {
    await Workout.deleteMany({});

    for (const workout of seedWorkouts) {
        await api
            .post("/api/workouts")
            .set("Authorization", `Bearer ${token}`)
            .send(workout)
            .expect(201);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});
describe("GET /api/workouts", () => {
    it("should return all workouts without authentication", async () => {
        const response = await api
            .get("/api/workouts")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(seedWorkouts.length);
    });

    it("should include a specific workout", async () => {
        const response = await api.get("/api/workouts").expect(200);

        expect(response.body.map((workout) => workout.title)).toContain(
            "Upper Body Blast"
        );
    });
});

describe("GET /api/workouts/:workoutId", () => {
    it("should return one workout without authentication", async () => {
        const workout = await Workout.findOne({
            title: "Upper Body Blast",
        });

        const response = await api
            .get(`/api/workouts/${workout._id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body.title).toBe("Upper Body Blast");
    });

    it("should return 400 for a malformed workout ID", async () => {
        await api
            .get("/api/workouts/not-a-valid-id")
            .expect(400);
    });

    it("should return 404 when the workout does not exist", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        await api
            .get(`/api/workouts/${nonExistingId}`)
            .expect(404);
    });
});
describe("POST /api/workouts", () => {
    const newWorkout = {
        title: "Core Strength",
        difficulty: "Advanced",
        description: "Advanced core strength workout",
        price: 45,
    };

    describe("when the user is authenticated", () => {
        it("should return status 201", async () => {
            await api
                .post("/api/workouts")
                .set("Authorization", `Bearer ${token}`)
                .send(newWorkout)
                .expect(201);
        });

        it("should save the workout in the database", async () => {
            const workoutsAtStart = await workoutsInDb();

            await api
                .post("/api/workouts")
                .set("Authorization", `Bearer ${token}`)
                .send(newWorkout)
                .expect(201);

            const workoutsAtEnd = await workoutsInDb();

            expect(workoutsAtEnd).toHaveLength(workoutsAtStart.length + 1);
            expect(workoutsAtEnd.map((workout) => workout.title)).toContain(
                "Core Strength"
            );
        });
    });

    describe("when the token is missing", () => {
        it("should return status 401", async () => {
            await api
                .post("/api/workouts")
                .send(newWorkout)
                .expect(401);
        });

        it("should not create a workout", async () => {
            const workoutsAtStart = await workoutsInDb();

            await api
                .post("/api/workouts")
                .send(newWorkout)
                .expect(401);

            const workoutsAtEnd = await workoutsInDb();

            expect(workoutsAtEnd).toHaveLength(workoutsAtStart.length);
        });
    });

    describe("when the token is malformed", () => {
        it("should return status 401", async () => {
            await api
                .post("/api/workouts")
                .set("Authorization", "Bearer not-a-valid-token")
                .send(newWorkout)
                .expect(401);
        });
    });
});
describe("PUT /api/workouts/:workoutId", () => {
    const updatedWorkout = {
        title: "Updated Upper Body Blast",
        difficulty: "Advanced",
        description: "Updated workout description",
        price: 55,
    };

    describe("when the user is authenticated", () => {
        it("should return status 200", async () => {
            const workout = await Workout.findOne({
                title: "Upper Body Blast",
            });

            await api
                .put(`/api/workouts/${workout._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updatedWorkout)
                .expect(200);
        });

        it("should update the workout in the database", async () => {
            const workout = await Workout.findOne({
                title: "Upper Body Blast",
            });

            await api
                .put(`/api/workouts/${workout._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updatedWorkout)
                .expect(200);

            const workoutAtEnd = await Workout.findById(workout._id);

            expect(workoutAtEnd.title).toBe("Updated Upper Body Blast");
            expect(workoutAtEnd.difficulty).toBe("Advanced");
            expect(workoutAtEnd.price).toBe(55);
        });
    });

    describe("when the token is missing", () => {
        it("should return status 401", async () => {
            const workout = await Workout.findOne({
                title: "Upper Body Blast",
            });

            await api
                .put(`/api/workouts/${workout._id}`)
                .send(updatedWorkout)
                .expect(401);
        });

        it("should not change the workout in the database", async () => {
            const workout = await Workout.findOne({
                title: "Upper Body Blast",
            });

            await api
                .put(`/api/workouts/${workout._id}`)
                .send(updatedWorkout)
                .expect(401);

            const workoutAtEnd = await Workout.findById(workout._id);

            expect(workoutAtEnd.title).toBe("Upper Body Blast");
            expect(workoutAtEnd.price).toBe(25);
        });
    });

    describe("when the workout ID is malformed", () => {
        it("should return status 400", async () => {
            await api
                .put("/api/workouts/not-a-valid-id")
                .set("Authorization", `Bearer ${token}`)
                .send(updatedWorkout)
                .expect(400);
        });
    });

    describe("when the workout does not exist", () => {
        it("should return status 404", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();

            await api
                .put(`/api/workouts/${nonExistingId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updatedWorkout)
                .expect(404);
        });
    });
});
describe("DELETE /api/workouts/:workoutId", () => {
    describe("when the user is authenticated", () => {
        it("should delete the workout and return status 204", async () => {
            const workoutsAtStart = await workoutsInDb();
            const workoutToDelete = workoutsAtStart[0];

            await api
                .delete(`/api/workouts/${workoutToDelete.id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(204);

            const workoutsAtEnd = await workoutsInDb();

            expect(workoutsAtEnd).toHaveLength(workoutsAtStart.length - 1);

            const titles = workoutsAtEnd.map((workout) => workout.title);
            expect(titles).not.toContain(workoutToDelete.title);
        });
    });

    describe("when the token is missing", () => {
        it("should return status 401 and not delete the workout", async () => {
            const workoutsAtStart = await workoutsInDb();
            const workoutToDelete = workoutsAtStart[0];

            await api
                .delete(`/api/workouts/${workoutToDelete.id}`)
                .expect(401);

            const workoutsAtEnd = await workoutsInDb();

            expect(workoutsAtEnd).toHaveLength(workoutsAtStart.length);

            const titles = workoutsAtEnd.map((workout) => workout.title);
            expect(titles).toContain(workoutToDelete.title);
        });
    });

    describe("when the workout ID is malformed", () => {
        it("should return status 400", async () => {
            await api
                .delete("/api/workouts/not-a-valid-id")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
        });
    });

    describe("when the workout does not exist", () => {
        it("should return status 404", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();

            await api
                .delete(`/api/workouts/${nonExistingId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
        });
    });
});
describe("Authentication token errors", () => {
    const newWorkout = {
        title: "Token Test Workout",
        difficulty: "Beginner",
        description: "Workout used for authentication tests",
        price: 20,
    };

    it("should reject an expired token and not create a workout", async () => {
        const user = await User.findOne({
            username: testUser.username,
        });

        const expiredToken = jwt.sign(
            { id: user._id.toString() },
            SECRET,
            { expiresIn: -1 }
        );

        const workoutsAtStart = await workoutsInDb();

        await api
            .post("/api/workouts")
            .set("Authorization", `Bearer ${expiredToken}`)
            .send(newWorkout)
            .expect(401);

        const workoutsAtEnd = await workoutsInDb();

        expect(workoutsAtEnd).toHaveLength(workoutsAtStart.length);
    });

    it("should reject a token belonging to a deleted user", async () => {
        const deletedUserData = {
            username: "deleted_workout_user",
            password: "Test1234!",
            phoneNumber: "0409999999",
            name: "Deleted User",
            role: "user",
        };

        const signupResponse = await api
            .post("/api/users/signup")
            .send(deletedUserData)
            .expect(201);

        const deletedUserToken = signupResponse.body.token;

        await User.deleteOne({
            username: deletedUserData.username,
        });

        const workoutsAtStart = await workoutsInDb();

        await api
            .post("/api/workouts")
            .set("Authorization", `Bearer ${deletedUserToken}`)
            .send(newWorkout)
            .expect(401);

        const workoutsAtEnd = await workoutsInDb();

        expect(workoutsAtEnd).toHaveLength(workoutsAtStart.length);
    });
});