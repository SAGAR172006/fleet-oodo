const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectToMongo } = require("./mongo");
const { createRateLimiter } = require("./middleware/rateLimit");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const dataRoutes = require("./routes/data");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(createRateLimiter({ windowMs: 60_000, max: 120 }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);

const PORT = process.env.PORT || 5000;
connectToMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FleetFlow backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect MongoDB", err);
    process.exit(1);
  });
