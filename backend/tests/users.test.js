const request = require("supertest");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const app = require("../app");
const User = require("../models/userModel");


describe("User authentication", () => {
  const username = `testuser_${Date.now()}`;
  const password = "Test1234!";
  let userId;

  beforeAll(async () => {
    const mongoUri =
      process.env.TEST_MONGO_URI || process.env.MONGO_URI;

    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    await mongoose.connection.close();
  });

  it("signs up a new user", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        username,
        password,
        phoneNumber: "0401234567",
        name: "Test User",
        role: "user",
      });

    expect(response.status).toBe(201);
    expect(response.body.username).toBe(username);
    expect(response.body.name).toBe("Test User");
    expect(response.body.phoneNumber).toBe("0401234567");
    expect(response.body.role).toBe("user");
    expect(response.body.token).toBeDefined();
    expect(response.body.password).toBeUndefined();

    const user = await User.findOne({ username });

    expect(user).not.toBeNull();
    userId = user._id;

    expect(user.password).not.toBe(password);
    expect(await bcrypt.compare(password, user.password)).toBe(true);
  });

  it("rejects duplicate username", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        username,
        password,
        phoneNumber: "0401234567",
        name: "Another User",
        role: "user",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Username already exists");
  });

  it("rejects missing signup fields", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        username: "missing_fields",
      });

    expect(response.status).toBe(400);
  });

  it("logs in with valid credentials", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({
        username,
        password,
      });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(username);
    expect(response.body.token).toBeDefined();
    expect(response.body.password).toBeUndefined();
  });

  it("rejects invalid credentials", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({
        username,
        password: "WrongPassword",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid username or password");
  });
});
