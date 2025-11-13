const express = require('express');
const router = express.Router();
const {
    getSongs,
    getSongById,
    addSong,
    updateSong,
    deleteSong
} = require('../controllers/songController');

router.get('/', getSongs);
router.get('/:id', getSongById);
router.post('/', addSong);
router.put('/:id', updateSong);
router.delete('/:id', deleteSong);

module.exports = router;