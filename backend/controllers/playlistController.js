import { playlists, songs } from "../mockData.js";

// GET ALL PLAYLISTS
export const getPlaylists = (req, res) => {
    res.json(playlists);
};

// GET PLAYLIST BY ID
export const getPlaylistById = (req, res) => {
    const playlistId = parseInt(req.params.id);
    const playlist = playlists.find(p => p.id === playlistId);

    if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
    }

    const playlistSongs = songs.filter(s => playlist.songs.includes(s.id));

    res.json({
        ...playlist,
        songs: playlistSongs
    });
};

// ADD NEW PLAYLIST
export const addPlaylist = (req, res) => {
    const { name } = req.body;

    const newPlaylist = {
        id: playlists.length + 1,
        name,
        songs: []
    };

    playlists.push(newPlaylist);

    res.json(newPlaylist);
};

// ADD SONG TO PLAYLIST
export const addSongToPlaylist = (req, res) => {
    const playlistId = parseInt(req.params.id);
    const { songId } = req.body;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
    }

    const song = songs.find(s => s.id === songId);
    if (!song) {
        return res.status(400).json({ message: "Invalid song ID" });
    }

    if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
    }

    res.json(playlist);
};

// DELETE PLAYLIST
export const deletePlaylist = (req, res) => {
    const playlistId = parseInt(req.params.id);
    const index = playlists.findIndex(p => p.id === playlistId);

    if (index === -1) {
        return res.status(404).json({ message: "Playlist not found" });
    }

    const deleted = playlists.splice(index, 1);
    res.json(deleted[0]);
};
