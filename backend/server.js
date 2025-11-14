import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./authRoutes.js";
import songRoutes from "./routes/songs.js";
import playlistRoutes from "./routes/playlists.js";

const app = express();

// Middleware MUST come BEFORE routes
app.use(cors());
app.use(express.json());

app.use("/audio", express.static("uploads/audio"));

// Routes
app.use("/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

console.log("Loaded PGPASSWORD =", process.env.PGPASSWORD);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

