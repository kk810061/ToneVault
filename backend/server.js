const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB before the API starts accepting requests.
connectDB();

// Allows requests from a frontend app, such as React running on another port.
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL 
    : function (origin, callback) { callback(null, true) },
  credentials: true,
}));

// Lets Express read JSON request bodies from Postman or a frontend.
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ToneVault API is running" });
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tones", require("./routes/toneRoutes"));
app.use("/api", require("./routes/catalogRoutes"));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
