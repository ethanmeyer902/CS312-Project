const express = require('express');
const router = express.Router();
const {
    getPlaylists,
    getPlaylistById,
    addPlaylist,
    addSongToPlaylist,
    deletePlaylist
} = require('../controllers/playlistController');

router.get('/', getPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', addPlaylist);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id', deletePlaylist); 