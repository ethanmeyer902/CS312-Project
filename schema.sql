-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SONGS TABLE
CREATE TABLE songs (
    song_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    artist VARCHAR(150) NOT NULL,
    album VARCHAR(150),
    genre VARCHAR(50),
    duration INTEGER,
    audio_file_path TEXT NOT NULL,
    cover_image_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PLAYLISTS
CREATE TABLE playlists (
    playlist_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PLAYLIST/SONGS RELATION (many-to-many)
CREATE TABLE playlist_songs (
    playlist_id INTEGER REFERENCES playlists(playlist_id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(song_id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, song_id)
);

-- RATINGS
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(song_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- LISTENING HISTORY
CREATE TABLE listening_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(song_id) ON DELETE CASCADE,
    played_at TIMESTAMP DEFAULT NOW()
);
