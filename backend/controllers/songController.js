import { songs } from "../mockData.js";

// GET ALL SONGS
export const getSongs = (req, res) => {
    res.json(songs);
};

// GET SONG BY ID
export const getSongById = (req, res) => {
    const songId = parseInt(req.params.id);
    const song = songs.find(s => s.id === songId);

    if (!song) {
        return res.status(404).json({ message: "Song not found" });
    }

    res.json(song);
};

// ADD NEW SONG
export const addSong = (req, res) => {
    const newSong = {
        id: songs.length + 1,
        ...req.body
    };

    songs.push(newSong);
    res.status(201).json(newSong);
};

// UPDATE SONG (added because your routes require it)
export const updateSong = (req, res) => {
    const songId = parseInt(req.params.id);
    const index = songs.findIndex(s => s.id === songId);

    if (index === -1) {
        return res.status(404).json({ message: "Song not found" });
    }

    const updatedSong = {
        ...songs[index],
        ...req.body
    };

    songs[index] = updatedSong;

    res.json(updatedSong);
};

// DELETE SONG
export const deleteSong = (req, res) => {
    const songId = parseInt(req.params.id);
    const index = songs.findIndex(s => s.id === songId);

    if (index === -1) {
        return res.status(404).json({ message: "Song not found" });
    }

    const deleted = songs.splice(index, 1);
    res.json(deleted[0]);
};
