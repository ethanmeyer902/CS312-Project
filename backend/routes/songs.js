import express from "express";

import {
    getSongs,
    getSongById,
    addSong,
    updateSong,
    deleteSong
} from "../controllers/songController.js"; // NOTE: .js extension required in ES modules

const router = express.Router();

router.get("/", getSongs);
router.get("/:id", getSongById);
router.post("/", addSong);
router.put("/:id", updateSong);
router.delete("/:id", deleteSong);

export default router;
