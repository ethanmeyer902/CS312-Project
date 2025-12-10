import { useEffect, useMemo, useState } from "react";
import "./Search.css";

const DEFAULT_API_BASE = "http://localhost:5000";

export default function Search({ apiBase = DEFAULT_API_BASE }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // search + filter state
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");

  // load songs from backend (mockData.js -> /api/songs)
  useEffect(() => {
    async function loadSongs() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${apiBase}/api/songs`);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setSongs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading songs:", err);
        setError("Could not load songs from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, [apiBase]);

  // dropdown options
  const artistOptions = useMemo(
    () =>
      Array.from(
        new Set(
          songs
            .map((s) => s.artist)
            .filter(Boolean)
        )
      ).sort(),
    [songs]
  );

  const albumOptions = useMemo(
    () =>
      Array.from(
        new Set(
          songs
            .map((s) => s.album)
            .filter(Boolean)
        )
      ).sort(),
    [songs]
  );

  const genreOptions = useMemo(
    () =>
      Array.from(
        new Set(
          songs
            .map((s) => s.genre)
            .filter(Boolean)
        )
      ).sort(),
    [songs]
  );

  // filtered list based on query + filters
  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return songs.filter((song) => {
      const title = String(song.title || "").toLowerCase();
      const artist = String(song.artist || "").toLowerCase();
      const album = String(song.album || "").toLowerCase();

      if (
        q &&
        !title.includes(q) &&
        !artist.includes(q) &&
        !album.includes(q)
      ) {
        return false;
      }

      if (selectedArtist && song.artist !== selectedArtist) return false;
      if (selectedAlbum && song.album !== selectedAlbum) return false;
      if (selectedGenre && song.genre !== selectedGenre) return false;

      return true;
    });
  }, [songs, query, selectedArtist, selectedAlbum, selectedGenre]);

  // only show results once they actually “do something”
  const anyFilterApplied =
    query.trim() !== "" ||
    selectedGenre !== "" ||
    selectedArtist !== "" ||
    selectedAlbum !== "";

  return (
    <div className="search-page">
      {/* search bar */}
      <input
        className="search-bar"
        placeholder="Search songs, artists, albums..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* filters */}
      <div className="filters">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">All genres</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
        >
          <option value="">All artists</option>
          {artistOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
        >
          <option value="">All albums</option>
          {albumOptions.map((al) => (
            <option key={al} value={al}>
              {al}
            </option>
          ))}
        </select>
      </div>

      {/* results */}
      <div className="search-results">
        {loading && <p>Loading songs…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && !anyFilterApplied && (
          <p style={{ color: "#666", marginTop: "1rem" }}>
            Start typing or choose a filter to search the library.
          </p>
        )}

        {!loading &&
          !error &&
          anyFilterApplied &&
          filteredSongs.length === 0 && (
            <p>No songs match your search.</p>
          )}

        {!loading &&
          !error &&
          anyFilterApplied &&
          filteredSongs.map((song) => (
            <div key={song.id} className="search-result-item">
              <div className="search-result-text">
                <div className="song-title">{song.title}</div>
                <div className="song-meta">
                  {song.artist && <span>{song.artist}</span>}
                  {song.album && <span> · {song.album}</span>}
                  {song.genre && <span> · {song.genre}</span>}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
