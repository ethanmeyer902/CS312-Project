import express from "express";
import { 
    getPlaylists, 
    getPlaylistById, 
    addPlaylist, 
    addSongToPlaylist, 
    deletePlaylist 
} from "../controllers/playlistController.js";

const router = express.Router();

router.get("/", getPlaylists);
router.get("/:id", getPlaylistById);
router.post("/", addPlaylist);
router.post("/:id/songs", addSongToPlaylist);
router.delete("/:id", deletePlaylist);

export default router;
