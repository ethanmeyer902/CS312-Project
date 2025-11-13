const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');

app.use('/api/songs', songRoutes);
app.use('/api/playlists', plyalistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));