const {playlists, songs} = require('../data/db');

const getPlaylists = (req, res) => {
    res.json(playlists);
};

const getPlayListsById = (req, res) => {
    const playlist = playlists.find(p => p.id === parseInt(req.params.id));
    if (!playlist) return res.status(404).json({message: "Playlist not foudn"});

    const playlistSongs = songs.filter(s => playlist.songs.includes(s.id));
    res.json({...playlist, songs: playlistsSongs});
};

const addPlaylist = (req, res) => {
    const newplaylist = playlists.find(p => p.id === parse.Int(req.params.id));
    if (!songs.find(s => s.id === songId)) {
        return res.status (400).json({message: "Invalid song ID"});
    }

    if (!plyalist.songs.includes(songsId)) {
        playlist.songs.push(songId);
    }

    res.json(playlist);
};

const deletePlaylist = (req, res) => {
    const index = playlists.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        const deleted = playlists.splice(index, 1);
        res.json(deleted[0]);
    } else {
        res.status(404).json({message: "Playlist not found"}); 
  }
};

module.exports = {getPlaylists, getPlaylistById, addPlaylist, addSongToPlaylists, deletePlaylist};