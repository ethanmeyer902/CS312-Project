import React, { useState } from "react";

// Temporary "logged in" user for ratings.
// Later, replace this with the real user id from your backend auth.
const CURRENT_USER = "user123";

// Fake songs for now; later you can load these from the backend
const initialSongs = [
  { id: 1, title: "Dreamscape", artist: "Nova" },
  { id: 2, title: "Midnight Drive", artist: "Echo" },
  { id: 3, title: "Static Waves", artist: "Horizon" },
  { id: 4, title: "Cloud City", artist: "Lumen" },
  { id: 5, title: "Ocean Lights", artist: "Astra" },
];

// Example starting playlists
const initialPlaylists = [
  { id: 101, name: "My First Playlist", songIds: [1, 2, 3] },
  { id: 102, name: "Chill Vibes", songIds: [4, 5] },
];

export default function PlaylistPage() {
  const [songs] = useState(initialSongs);
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [dragging, setDragging] = useState(null); // { playlistId, fromIndex } or null
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Task 2 state: song details and feedback
  // songFeedback[songId] = { ratings: {userId: number}, reviews: [{id, author, text, date}] }
  const [songFeedback, setSongFeedback] = useState({});
  const [selectedSongId, setSelectedSongId] = useState(null);

  // Task 3: user profile & listening history
  const [activeTab, setActiveTab] = useState("playlists"); // 'playlists' | 'dashboard'
  const [profile, setProfile] = useState({
    displayName: "Demo User",
    email: "user@example.com",
    favoriteGenre: "Lo-fi beats",
    bio: "Music lover and playlist curator.",
  });
  const [listeningHistory, setListeningHistory] = useState([]);

  function getSongsForPlaylist(playlist) {
    return playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter(Boolean);
  }

  function getSongById(id) {
    return songs.find((s) => s.id === id) || null;
  }

  function handleCreatePlaylist(event) {
    event.preventDefault();
    const trimmed = newPlaylistName.trim();
    if (!trimmed) return;

    const newPlaylist = {
      id: Date.now(),
      name: trimmed,
      songIds: [],
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
    setNewPlaylistName("");
  }

  function handleDeletePlaylist(id) {
    const target = playlists.find((pl) => pl.id === id);
    if (!target) return;

    const confirmDelete = window.confirm(
      `Delete playlist "${target.name}"?`
    );
    if (!confirmDelete) return;

    setPlaylists((prev) => prev.filter((pl) => pl.id !== id));

    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(null);
    }
  }

  function handleRenamePlaylist(id, newName) {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === id ? { ...pl, name: trimmed } : pl
      )
    );
  }

  function handleReorderSongs(playlistId, fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;

        const newSongIds = [...pl.songIds];
        const [moved] = newSongIds.splice(fromIndex, 1);
        newSongIds.splice(toIndex, 0, moved);

        return { ...pl, songIds: newSongIds };
      })
    );
  }

  function handleAddSongToSelectedPlaylist(songId) {
    if (!selectedPlaylistId) {
      alert("Select a playlist first, then add songs.");
      return;
    }

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== selectedPlaylistId) return pl;

        // avoid duplicates
        if (pl.songIds.includes(songId)) return pl;

        return {
          ...pl,
          songIds: [...pl.songIds, songId],
        };
      })
    );
  }

  // Record a "play" event for listening history (frontend only)
  function recordPlay(songId, sourceLabel) {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;

    const entry = {
      id: Date.now() + Math.random(),
      songId,
      title: song.title,
      artist: song.artist,
      source: sourceLabel,
      playedAt: new Date().toLocaleString(),
    };

    setListeningHistory((prev) => [entry, ...prev].slice(0, 25)); // keep last 25 plays
  }

  // Task 2: rating handler (one rating per user)
  function handleRateSong(songId, ratingValue) {
    setSongFeedback((prev) => {
      const existing = prev[songId] || { ratings: {}, reviews: [] };

      return {
        ...prev,
        [songId]: {
          ...existing,
          ratings: {
            ...existing.ratings,
            [CURRENT_USER]: ratingValue, // overwrite or set
          },
        },
      };
    });
  }

  // Task 2: review handler
  function handleAddReview(songId, author, text) {
    const trimmedAuthor = author.trim() || "Anonymous";
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setSongFeedback((prev) => {
      const existing = prev[songId] || { ratings: {}, reviews: [] };
      const newReview = {
        id: Date.now(),
        author: trimmedAuthor,
        text: trimmedText,
        date: new Date().toLocaleDateString(),
      };
      return {
        ...prev,
        [songId]: {
          ...existing,
          reviews: [...existing.reviews, newReview],
        },
      };
    });
  }

  // Delete a review
  function handleDeleteReview(songId, reviewId) {
    setSongFeedback((prev) => {
      const existing = prev[songId];
      if (!existing) return prev;

      return {
        ...prev,
        [songId]: {
          ...existing,
          reviews: existing.reviews.filter((r) => r.id !== reviewId),
        },
      };
    });
  }

  // Update a review's text
  function handleUpdateReview(songId, reviewId, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return;

    setSongFeedback((prev) => {
      const existing = prev[songId];
      if (!existing) return prev;

      return {
        ...prev,
        [songId]: {
          ...existing,
          reviews: existing.reviews.map((r) =>
            r.id === reviewId ? { ...r, text: trimmed } : r
          ),
        },
      };
    });
  }

  function handleOpenSongDetails(songId) {
    setSelectedSongId(songId);
  }

  function handleCloseSongDetails() {
    setSelectedSongId(null);
  }

  return (
    <div
      style={{
        padding: "1.5rem",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "system-ui, sans-serif",
        background: "#f5f5f5",
        minHeight: "100vh",
        color: "#000",
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>Music App Demo</h1>

      {/* Simple tab switcher for Task 3 */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("playlists")}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #888",
            background:
              activeTab === "playlists" ? "#fff" : "#e0e0e0",
            cursor: "pointer",
          }}
        >
          Playlists & Browse
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #888",
            background:
              activeTab === "dashboard" ? "#fff" : "#e0e0e0",
            cursor: "pointer",
          }}
        >
          Profile & History
        </button>
      </div>

      {/* PLAYLIST / BROWSE TAB */}
      {activeTab === "playlists" && (
        <>
          {/* Create playlist form */}
          <form
            onSubmit={handleCreatePlaylist}
            style={{
              marginBottom: "1rem",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              placeholder="New playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                flex: 1,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: "4px",
                border: "1px solid #888",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Create Playlist
            </button>
          </form>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Left: song library */}
            <div
              style={{
                flex: "1 1 300px",
                minWidth: "280px",
                background: "#fff",
                padding: "0.75rem",
                borderRadius: "8px",
                boxShadow: "0 0 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  fontSize: "1.1rem",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "0.4rem",
                  marginBottom: "0.6rem",
                }}
              >
                Song Library
              </h2>

              {songs.map((song) => (
                <div
                  key={song.id}
                  style={{
                    padding: "0.35rem 0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginBottom: "0.3rem",
                    background: "#fff",
                    fontSize: "0.9rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#000",
                    gap: "0.5rem",
                  }}
                >
                  <span>
                    {song.title} - {song.artist}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <button
                      onClick={() => recordPlay(song.id, "Library")}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleOpenSongDetails(song.id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() =>
                        handleAddSongToSelectedPlaylist(song.id)
                      }
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: selectedPlaylistId
                          ? "#fff"
                          : "#ddd",
                        cursor: selectedPlaylistId
                          ? "pointer"
                          : "not-allowed",
                        fontSize: "0.8rem",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: playlists */}
            <div
              style={{
                flex: "1 1 300px",
                minWidth: "280px",
                background: "#fff",
                padding: "0.75rem",
                borderRadius: "8px",
                boxShadow: "0 0 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  fontSize: "1.1rem",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "0.4rem",
                  marginBottom: "0.6rem",
                }}
              >
                Playlists
              </h2>

              {playlists.length === 0 && (
                <p style={{ fontStyle: "italic", color: "#333" }}>
                  No playlists yet. Create one above.
                </p>
              )}

              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  getSongsForPlaylist={getSongsForPlaylist}
                  onDelete={handleDeletePlaylist}
                  onRename={handleRenamePlaylist}
                  dragging={dragging}
                  setDragging={setDragging}
                  onReorderSongs={handleReorderSongs}
                  selectedPlaylistId={selectedPlaylistId}
                  setSelectedPlaylistId={setSelectedPlaylistId}
                  onOpenSongDetails={handleOpenSongDetails}
                  onPlaySong={(songId) =>
                    recordPlay(songId, `Playlist: ${playlist.name}`)
                  }
                />
              ))}
            </div>
          </div>

          {/* Song details panel lives under the playlist section */}
          {selectedSongId && (
            <SongDetailPanel
              song={getSongById(selectedSongId)}
              feedback={songFeedback[selectedSongId]}
              onClose={handleCloseSongDetails}
              onRate={(value) => handleRateSong(selectedSongId, value)}
              onAddReview={(author, text) =>
                handleAddReview(selectedSongId, author, text)
              }
              onDeleteReview={(reviewId) =>
                handleDeleteReview(selectedSongId, reviewId)
              }
              onUpdateReview={(reviewId, newText) =>
                handleUpdateReview(selectedSongId, reviewId, newText)
              }
            />
          )}
        </>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <UserDashboard
          profile={profile}
          onUpdateProfile={setProfile}
          playlists={playlists}
          songs={songs}
          listeningHistory={listeningHistory}
        />
      )}
    </div>
  );
}

function PlaylistCard({
  playlist,
  getSongsForPlaylist,
  onDelete,
  onRename,
  dragging,
  setDragging,
  onReorderSongs,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onOpenSongDetails,
  onPlaySong,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playlist.name);

  const playlistSongs = getSongsForPlaylist(playlist);
  const isSelected = selectedPlaylistId === playlist.id;

  function handleSaveName() {
    onRename(playlist.id, nameInput);
    setIsEditing(false);
  }

  return (
    <div
      style={{
        border: isSelected ? "2px solid #4a90e2" : "1px solid #ddd",
        borderRadius: "8px",
        padding: "0.6rem",
        marginBottom: "0.6rem",
        background: isSelected ? "#e8f1ff" : "#fafafa",
        cursor: "pointer",
      }}
      onClick={() => {
        if (isSelected) {
          setSelectedPlaylistId(null); // deselect if clicking again
        } else {
          setSelectedPlaylistId(playlist.id);
        }
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.3rem",
        }}
      >
        {isEditing ? (
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{
                width: "100%",
                padding: "0.3rem 0.4rem",
                boxSizing: "border-box",
                marginBottom: "0.3rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button onClick={handleSaveName}>Save</button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setNameInput(playlist.name);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "1rem",
                margin: 0,
                color: "#000",
              }}
            >
              {playlist.name}
            </p>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(playlist.id);
                }}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <ul
        style={{
          listStyle: "none",
          paddingLeft: 0,
          marginTop: "0.4rem",
          borderTop: "1px solid #eee",
          paddingTop: "0.4rem",
        }}
      >
        {playlistSongs.length === 0 && (
          <li style={{ fontStyle: "italic", color: "#333" }}>
            No songs in this playlist.
          </li>
        )}

        {playlistSongs.map((song, index) => (
          <li
            key={song.id}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              setDragging({
                playlistId: playlist.id,
                fromIndex: index,
              });
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              setDragging(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={(e) => {
              e.stopPropagation();
              if (!dragging) return;
              if (dragging.playlistId !== playlist.id) return;

              const from = dragging.fromIndex;
              const to = index;
              onReorderSongs(playlist.id, from, to);
            }}
            style={{
              padding: "0.35rem 0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "0.3rem",
              cursor: "grab",
              background: "#fff",
              color: "#000",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              opacity:
                dragging &&
                dragging.playlistId === playlist.id &&
                dragging.fromIndex === index
                  ? 0.5
                  : 1,
            }}
          >
            <span>
              {song.title} - {song.artist}
            </span>
            <div
              style={{
                display: "flex",
                gap: "0.3rem",
                alignItems: "center",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaySong(song.id);
                }}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #888",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Play
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSongDetails(song.id);
                }}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #888",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Details
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SongDetailPanel({
  song,
  feedback,
  onClose,
  onRate,
  onAddReview,
  onDeleteReview,
  onUpdateReview,
}) {
  if (!song) return null;

  const ratingsObj = feedback?.ratings || {};
  const ratingValues = Object.values(ratingsObj);
  const reviews = feedback?.reviews || [];

  const averageRating =
    ratingValues.length > 0
      ? (
          ratingValues.reduce((sum, r) => sum + r, 0) /
          ratingValues.length
        ).toFixed(1)
      : null;

  const [nameInput, setNameInput] = useState("");
  const [reviewInput, setReviewInput] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");

  function handleSubmitReview(e) {
    e.preventDefault();
    onAddReview(nameInput, reviewInput);
    setReviewInput("");
    // keep name in case user leaves multiple reviews
  }

  function startEditingReview(review) {
    setEditingReviewId(review.id);
    setEditingReviewText(review.text);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingReviewId) return;
    onUpdateReview(editingReviewId, editingReviewText);
    setEditingReviewId(null);
    setEditingReviewText("");
  }

  function handleCancelEdit(e) {
    e.preventDefault();
    setEditingReviewId(null);
    setEditingReviewText("");
  }

  return (
    <div
      style={{
        marginTop: "1.5rem",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 0 6px rgba(0,0,0,0.15)",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 0.3rem 0" }}>{song.title}</h2>
          <p style={{ margin: 0, color: "#555" }}>by {song.artist}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Song ID: {song.id}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "0.25rem 0.6rem",
            borderRadius: "4px",
            border: "1px solid #888",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>

      {/* Rating + Reviews side-by-side */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Rating */}
        <div
          style={{
            flex: "1 1 250px",
            minWidth: "240px",
          }}
        >
          <h3 style={{ marginBottom: "0.4rem" }}>Rating</h3>
          <RatingStars
            onRate={onRate}
            userRating={ratingsObj[CURRENT_USER]}
          />
          <p style={{ marginTop: "0.4rem", fontSize: "0.9rem" }}>
            {averageRating
              ? `Average rating: ${averageRating} (${ratingValues.length} rating${
                  ratingValues.length === 1 ? "" : "s"
                })`
              : "No ratings yet. Be the first to rate this song."}
          </p>
        </div>

        {/* Right: Reviews */}
        <div
          style={{
            flex: "2 1 300px",
            minWidth: "260px",
          }}
        >
          <h3 style={{ marginBottom: "0.4rem" }}>Reviews</h3>

          {reviews.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              No reviews yet.
            </p>
          )}

          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                borderTop: "1px solid #eee",
                paddingTop: "0.4rem",
                marginTop: "0.4rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                {rev.author}{" "}
                <span
                  style={{
                    fontWeight: "normal",
                    color: "#777",
                    fontSize: "0.8rem",
                  }}
                >
                  {rev.date}
                </span>
              </p>

              {/* Either show edit form or static text */}
              {editingReviewId === rev.id ? (
                <form
                  onSubmit={handleSaveEdit}
                  style={{
                    marginTop: "0.3rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                  }}
                >
                  <textarea
                    value={editingReviewText}
                    onChange={(e) =>
                      setEditingReviewText(e.target.value)
                    }
                    rows={3}
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      resize: "vertical",
                      boxSizing: "border-box",
                      width: "100%",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p
                    style={{
                      margin: "0.2rem 0 0.3rem 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    {rev.text}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        startEditingReview(rev);
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteReview(rev.id);
                        if (editingReviewId === rev.id) {
                          setEditingReviewId(null);
                          setEditingReviewText("");
                        }
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        border: "1px solid #888",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* New review form */}
          <form
            onSubmit={handleSubmitReview}
            style={{
              marginTop: "0.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              maxWidth: "400px",
            }}
          >
            <input
              type="text"
              placeholder="Your name (optional)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                width: "100%",
              }}
            />
            <textarea
              placeholder="Write your review..."
              value={reviewInput}
              onChange={(e) => setReviewInput(e.target.value)}
              rows={3}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
                boxSizing: "border-box",
                width: "100%",
              }}
            />
            <button
              type="submit"
              style={{
                alignSelf: "flex-start",
                padding: "0.4rem 0.8rem",
                borderRadius: "4px",
                border: "1px solid #888",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RatingStars({ onRate, userRating }) {
  const [hovered, setHovered] = useState(0);

  function handleClick(value) {
    onRate(value);
  }

  const activeValue = hovered || userRating || 0;

  return (
    <div style={{ display: "flex", gap: "0.2rem", fontSize: "1.6rem" }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleClick(value)}
          style={{
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {value <= activeValue ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function UserDashboard({
  profile,
  onUpdateProfile,
  playlists,
  songs,
  listeningHistory,
}) {
  const totalPlaylists = playlists.length;
  const totalSongsInPlaylists = playlists.reduce(
    (sum, pl) => sum + pl.songIds.length,
    0
  );
  const uniqueSongCount = new Set(
    playlists.flatMap((pl) => pl.songIds)
  ).size;

  const latestPlays = listeningHistory.slice(0, 10);

  function handleProfileChange(field, value) {
    onUpdateProfile({
      ...profile,
      [field]: value,
    });
  }

  return (
    <div
      style={{
        marginTop: "0.5rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "flex-start",
      }}
    >
      {/* Left: Profile editor */}
      <div
        style={{
          flex: "1 1 280px",
          minWidth: "260px",
          background: "#fff",
          padding: "0.75rem",
          borderRadius: "8px",
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "1.1rem",
            borderBottom: "1px solid #ddd",
            paddingBottom: "0.4rem",
            marginBottom: "0.6rem",
          }}
        >
          User Profile
        </h2>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label style={{ fontSize: "0.9rem" }}>
            Display Name
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) =>
                handleProfileChange("displayName", e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>

          <label style={{ fontSize: "0.9rem" }}>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                handleProfileChange("email", e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>

          <label style={{ fontSize: "0.9rem" }}>
            Favorite Genre
            <input
              type="text"
              value={profile.favoriteGenre}
              onChange={(e) =>
                handleProfileChange("favoriteGenre", e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>

          <label style={{ fontSize: "0.9rem" }}>
            Bio
            <textarea
              value={profile.bio}
              onChange={(e) =>
                handleProfileChange("bio", e.target.value)
              }
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
          </label>
        </form>
      </div>

      {/* Right: Stats + Listening history */}
      <div
        style={{
          flex: "2 1 340px",
          minWidth: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Stats card */}
        <div
          style={{
            background: "#fff",
            padding: "0.75rem",
            borderRadius: "8px",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "1.1rem",
              borderBottom: "1px solid #ddd",
              paddingBottom: "0.4rem",
              marginBottom: "0.6rem",
            }}
          >
            Listening Overview
          </h2>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold" }}>
                {totalPlaylists}
              </div>
              <div style={{ color: "#555" }}>Playlists</div>
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>
                {totalSongsInPlaylists}
              </div>
              <div style={{ color: "#555" }}>Playlist songs</div>
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>
                {uniqueSongCount}
              </div>
              <div style={{ color: "#555" }}>Unique tracks</div>
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>
                {listeningHistory.length}
              </div>
              <div style={{ color: "#555" }}>
                Total plays (demo)
              </div>
            </div>
          </div>
        </div>

        {/* Listening history card */}
        <div
          style={{
            background: "#fff",
            padding: "0.75rem",
            borderRadius: "8px",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "1.1rem",
              borderBottom: "1px solid #ddd",
              paddingBottom: "0.4rem",
              marginBottom: "0.6rem",
            }}
          >
            Recent Listening History
          </h2>

          {latestPlays.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              No plays recorded yet. Use the Play buttons in the song
              list or playlists to add to your history.
            </p>
          )}

          {latestPlays.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                fontSize: "0.9rem",
              }}
            >
              {latestPlays.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    paddingBottom: "0.25rem",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {entry.title}{" "}
                    <span style={{ fontWeight: "normal" }}>
                      by {entry.artist}
                    </span>
                  </div>
                  <div style={{ color: "#555" }}>
                    Played from{" "}
                    <span style={{ fontStyle: "italic" }}>
                      {entry.source}
                    </span>{" "}
                    at {entry.playedAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
