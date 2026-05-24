import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initalize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to handle CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this to your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

//static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.use(errorHandler);

//404 error handling
app.use((req, res) => {
  res.status(404).json({
    status: false,
    error: "Not Found",
    statusCode: 404,
  });
});

//start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
