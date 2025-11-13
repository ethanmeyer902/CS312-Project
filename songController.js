const {songs} = require('../data/db');

const getSongs = (req, res) => {
    res.json(songs);
};

const getSongById = (req, res) => {
    const song = songs.find(s => s.id === parseInt(req.params.id));
    song ? res.json(song) : res.status(404).json({message: "Song not found"});
};

const addSong = (req, res) => {
    const newSong = {id: songs.length + 1, ...req.body};
    songs.push(newSong);
    res.status(201).json(newSong);
};

const deleteSong = (req, res) => {
    const index = songs.findIndex(s => s.id === parseInt(req.params.id));
    if (index !== -1) {
        const deleted = songs.splice(index, 1);
        res.json(deleted[0]);
    }else{
        res.status(404).json({message: "Song not foudn"});
    }
    };
    
    module.exports = {getSongs, getSongById, addSong, updateSong, deleteSong};