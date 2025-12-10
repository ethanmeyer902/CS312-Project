import React, { useState, useEffect } from "react";

// Temporary current user id for ratings (you can later use real backend user ids)
const CURRENT_USER = "user123";

// Static song catalog for now (could later come from backend)
const initialSongs = [
  { id: 1, title: "Dreamscape", artist: "Nova" },
  { id: 2, title: "Midnight Drive", artist: "Echo" },
  { id: 3, title: "Static Waves", artist: "Horizon" },
  { id: 4, title: "Cloud City", artist: "Lumen" },
  { id: 5, title: "Ocean Lights", artist: "Astra" },
];

export default function PlaylistPage({
  user,
  initialTab = "playlists", // "playlists" | "dashboard"
  hideInnerTabs = false,
}) {
  const storagePrefix =
    user && user.email ? `musicapp_${user.email}` : "musicapp_guest";

  const [songs] = useState(initialSongs);

  // Playlists: per-user, from localStorage
  const [playlists, setPlaylists] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(`${storagePrefix}_playlists`);
    return stored ? JSON.parse(stored) : [];
  });

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [dragging, setDragging] = useState(null); // { playlistId, fromIndex } or null
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Song feedback (ratings + reviews)
  const [songFeedback, setSongFeedback] = useState(() => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(`${storagePrefix}_feedback`);
    return stored ? JSON.parse(stored) : {};
  });
  const [selectedSongId, setSelectedSongId] = useState(null);

  // Which main view we are in (Library vs Profile)
  const [activeTab, setActiveTab] = useState(initialTab);

  // User profile
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") {
      return {
        displayName: user?.name || "",
        email: user?.email || "",
        favoriteGenre: "",
        bio: "",
      };
    }
    const stored = window.localStorage.getItem(`${storagePrefix}_profile`);
    if (stored) return JSON.parse(stored);
    return {
      displayName: user?.name || "",
      email: user?.email || "",
      favoriteGenre: "",
      bio: "",
    };
  });

  // Listening history
  const [listeningHistory, setListeningHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(`${storagePrefix}_history`);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist playlists, feedback, profile, history whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      `${storagePrefix}_playlists`,
      JSON.stringify(playlists)
    );
  }, [storagePrefix, playlists]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      `${storagePrefix}_feedback`,
      JSON.stringify(songFeedback)
    );
  }, [storagePrefix, songFeedback]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      `${storagePrefix}_profile`,
      JSON.stringify(profile)
    );
  }, [storagePrefix, profile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      `${storagePrefix}_history`,
      JSON.stringify(listeningHistory)
    );
  }, [storagePrefix, listeningHistory]);

  // --- core helpers ---

  function getSongsForPlaylist(playlist) {
    return playlist.songIds
      .map((id) => songs.find((s) => s.id === id))
      .filter(Boolean);
  }

  function handleCreatePlaylist(e) {
    e.preventDefault();
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

  function handleAddSongToSelectedPlaylist(songId) {
    if (!selectedPlaylistId) return;

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== selectedPlaylistId) return pl;
        if (pl.songIds.includes(songId)) return pl;
        return { ...pl, songIds: [...pl.songIds, songId] };
      })
    );
  }

  function handleRemoveSongFromPlaylist(playlistId, songId) {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          songIds: pl.songIds.filter((id) => id !== songId),
        };
      })
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

  // --- ratings & reviews ---

  function getSongFeedback(songId) {
    return songFeedback[songId] || { ratings: {}, reviews: [] };
  }

  function getAverageRating(songId) {
    const fb = getSongFeedback(songId);
    const ratings = Object.values(fb.ratings);
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + r, 0);
    return sum / ratings.length;
  }

  function handleRateSong(songId, rating) {
    setSongFeedback((prev) => {
      const existing = prev[songId] || { ratings: {}, reviews: [] };
      return {
        ...prev,
        [songId]: {
          ...existing,
          ratings: {
            ...existing.ratings,
            [CURRENT_USER]: rating,
          },
        },
      };
    });
  }

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

  function handleDeleteReview(songId, reviewId) {
    setSongFeedback((prev) => {
      const existing = prev[songId];
      if (!existing) return prev;

      return {
        ...prev,
        [songId]: {
          ...existing,
          reviews: existing.reviews.filter(
            (rev) => rev.id !== reviewId
          ),
        },
      };
    });
  }

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
          reviews: existing.reviews.map((rev) =>
            rev.id === reviewId ? { ...rev, text: trimmed } : rev
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

  // "Play" a song and record in listening history
  function handlePlaySong(song) {
    if (!song) return;

    const entry = {
      id: Date.now(),
      songId: song.id,
      title: song.title,
      artist: song.artist,
      playedAt: new Date().toLocaleTimeString(),
      source: selectedPlaylistId
        ? `Playlist: ${
            playlists.find((p) => p.id === selectedPlaylistId)?.name ||
            "Unknown"
          }`
        : "Song Library",
    };

    setListeningHistory((prev) => [entry, ...prev]);
  }

  // Stats for Profile & History
  const totalPlaylists = playlists.length;
  const totalPlaylistSongs = playlists.reduce(
    (acc, pl) => acc + pl.songIds.length,
    0
  );
  const uniqueTrackIds = new Set(
    playlists.flatMap((pl) => pl.songIds)
  );
  const uniqueTrackCount = uniqueTrackIds.size;
  const totalPlays = listeningHistory.length;

  // --- render ---

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
      {/* Inner tab buttons (only used if hideInnerTabs === false) */}
      {!hideInnerTabs && (
        <div
          style={{
            margin: "0 auto 1rem",
            display: "flex",
            gap: "0.5rem",
            maxWidth: "1000px",
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
            Playlists &amp; Browse
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
            Profile &amp; History
          </button>
        </div>
      )}

      {/* LIBRARY VIEW */}
      {activeTab === "playlists" && (
        <>
          {/* Create playlist form (horizontal, centered) */}
          <form
            onSubmit={handleCreatePlaylist}
            style={{
              margin: "0 auto 1rem",
              display: "flex",
              gap: "0.5rem",
              maxWidth: "1000px",
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
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.4rem 0.8rem",
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
              flexWrap: "wrap",
              alignItems: "flex-start",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            {/* Song Library */}
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
                Song Library
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                {songs.map((song) => {
                  const avgRating = getAverageRating(song.id);
                  return (
                    <li
                      key={song.id}
                      style={{
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        padding: "0.4rem 0.6rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#fafafa",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.95rem" }}>
                          {song.title}{" "}
                          <span style={{ color: "#666" }}>
                            - {song.artist}
                          </span>
                        </div>
                        {avgRating && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#444",
                              marginTop: "0.15rem",
                            }}
                          >
                            Rating:{" "}
                            {avgRating.toFixed(1)} / 5
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.35rem",
                        }}
                      >
                        <button
                          onClick={() => handlePlaySong(song)}
                          style={{
                            padding: "0.25rem 0.6rem",
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
                          onClick={() =>
                            handleOpenSongDetails(song.id)
                          }
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
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Playlists column */}
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
                Playlists
              </h2>

              {playlists.length === 0 && (
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  No playlists yet. Create one to get started.
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
                  onPlaySong={handlePlaySong}
                  onRemoveSong={handleRemoveSongFromPlaylist}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* PROFILE VIEW */}
      {activeTab === "dashboard" && (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <ProfileAndHistory
            profile={profile}
            onUpdateProfile={setProfile}
            playlists={playlists}
            songs={songs}
            listeningHistory={listeningHistory}
            totalPlaylists={totalPlaylists}
            totalPlaylistSongs={totalPlaylistSongs}
            uniqueTrackCount={uniqueTrackCount}
            totalPlays={totalPlays}
          />
        </div>
      )}

      {/* Song details modal */}
      {selectedSongId && (
        <SongDetailsModal
          song={songs.find((s) => s.id === selectedSongId)}
          feedback={getSongFeedback(selectedSongId)}
          onClose={handleCloseSongDetails}
          onRate={(rating) =>
            handleRateSong(selectedSongId, rating)
          }
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
    </div>
  );
}

/* ----------------- PlaylistCard ----------------- */

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
  onRemoveSong,
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
        borderRadius: "8px",
        border: "1px solid #ddd",
        padding: "0.6rem",
        marginBottom: "0.6rem",
        background: isSelected ? "#f0f7ff" : "#fafafa",
      }}
      onClick={() => setSelectedPlaylistId(playlist.id)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.4rem",
        }}
      >
        {isEditing ? (
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveName();
              }
            }}
            autoFocus
            style={{
              fontWeight: "bold",
              borderRadius: "4px",
              border: "1px solid #ccc",
              padding: "0.2rem 0.4rem",
            }}
          />
        ) : (
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
            }}
          >
            {playlist.name}
          </h3>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.35rem",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                handleSaveName();
              } else {
                setIsEditing(true);
              }
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
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(playlist.id);
            }}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              border: "1px solid #c33",
              background: "#fff",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "#c33",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {playlistSongs.length === 0 ? (
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
          }}
        >
          No songs yet. Select this playlist, then use "Add" in the
          Song Library.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
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
                borderRadius: "6px",
                border: "1px solid #ddd",
                padding: "0.35rem 0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>
                {song.title}{" "}
                <span style={{ color: "#666" }}>- {song.artist}</span>
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "0.3rem",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySong(song);
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSong(playlist.id, song.id);
                  }}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #c33",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: "#c33",
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------- SongDetailsModal ----------------- */

function SongDetailsModal({
  song,
  feedback,
  onClose,
  onRate,
  onAddReview,
  onDeleteReview,
  onUpdateReview,
}) {
  const [ratingInput, setRatingInput] = useState(
    feedback.ratings[CURRENT_USER] || 0
  );
  const [nameInput, setNameInput] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");

  if (!song) return null;

  const ratings = Object.values(feedback.ratings || {});
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r, 0) / ratings.length
      : null;

  function handleSubmitRating(e) {
    e.preventDefault();
    const rating = Number(ratingInput);
    if (rating < 1 || rating > 5) return;
    onRate(rating);
  }

  function handleSubmitReview(e) {
    e.preventDefault();
    onAddReview(nameInput, reviewInput);
    setReviewInput("");
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
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          maxWidth: "560px",
          width: "90%",
          borderRadius: "10px",
          padding: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.2rem",
            }}
          >
            {song.title}{" "}
            <span style={{ color: "#666", fontSize: "1rem" }}>
              - {song.artist}
            </span>
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
          <p style={{ margin: 0 }}>
            Here you can rate and review this track. Use this section to
            leave feedback as if you were on a real music service.
          </p>
        </div>

        <div
          style={{
            marginBottom: "1rem",
            borderBottom: "1px solid #eee",
            paddingBottom: "0.75rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
            }}
          >
            Ratings
          </h3>
          <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Average rating:{" "}
            {avgRating ? `${avgRating.toFixed(1)} / 5` : "Not yet rated"}
          </p>

          <form
            onSubmit={handleSubmitRating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.3rem",
            }}
          >
            <label style={{ fontSize: "0.9rem" }}>
              Your rating:
              <select
                value={ratingInput}
                onChange={(e) =>
                  setRatingInput(Number(e.target.value))
                }
                style={{
                  marginLeft: "0.4rem",
                  padding: "0.2rem 0.3rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value={0}>Select</option>
                <option value={1}>1 star</option>
                <option value={2}>2 stars</option>
                <option value={3}>3 stars</option>
                <option value={4}>4 stars</option>
                <option value={5}>5 stars</option>
              </select>
            </label>
            <button
              type="submit"
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid #888",
                background: "#fff",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Save rating
            </button>
          </form>
        </div>

        <div>
          <h3
            style={{
              marginTop: 0,
              fontSize: "1rem",
            }}
          >
            Reviews
          </h3>

          {feedback.reviews.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              No reviews yet. Be the first to leave one.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.4rem",
              }}
            >
              {feedback.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    padding: "0.5rem 0.6rem",
                    background: "#fafafa",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>{rev.author}</strong>{" "}
                    <span
                      style={{
                        color: "#666",
                        fontSize: "0.8rem",
                      }}
                    >
                      {rev.date}
                    </span>
                  </p>

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
                            padding: "0.25rem 0.6rem",
                            borderRadius: "4px",
                            border: "1px solid #888",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: "0.25rem 0.6rem",
                            borderRadius: "4px",
                            border: "1px solid #888",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p
                      style={{
                        marginTop: "0.25rem",
                        marginBottom: "0.25rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      {rev.text}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    <button
                      onClick={() => startEditingReview(rev)}
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
                      onClick={() => onDeleteReview(rev.id)}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        border: "1px solid #c33",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        color: "#c33",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
            >
              <label style={{ fontSize: "0.85rem" }}>
                Name (optional)
                <input
                  value={nameInput}
                  onChange={(e) =>
                    setNameInput(e.target.value)
                  }
                  style={{
                    padding: "0.35rem 0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                    width: "100%",
                    marginTop: "0.15rem",
                  }}
                />
              </label>
              <label style={{ fontSize: "0.85rem" }}>
                Review
                <textarea
                  value={reviewInput}
                  onChange={(e) =>
                    setReviewInput(e.target.value)
                  }
                  rows={3}
                  style={{
                    padding: "0.4rem 0.6rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                    boxSizing: "border-box",
                    width: "100%",
                    marginTop: "0.15rem",
                  }}
                />
              </label>
            </div>
            <button
              type="submit"
              style={{
                alignSelf: "flex-start",
                padding: "0.3rem 0.7rem",
                borderRadius: "4px",
                border: "1px solid #888",
                background: "#fff",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Add review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Profile & History ----------------- */

function ProfileAndHistory({
  profile,
  onUpdateProfile,
  playlists,
  songs,
  listeningHistory,
  totalPlaylists,
  totalPlaylistSongs,
  uniqueTrackCount,
  totalPlays,
}) {
  function handleChange(field, value) {
    onUpdateProfile({
      ...profile,
      [field]: value,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      {/* Profile card */}
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
              value={profile.displayName}
              onChange={(e) =>
                handleChange("displayName", e.target.value)
              }
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </label>
          <label style={{ fontSize: "0.9rem" }}>
            Email
            <input
              value={profile.email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </label>
          <label style={{ fontSize: "0.9rem" }}>
            Favorite Genre
            <input
              value={profile.favoriteGenre}
              onChange={(e) =>
                handleChange("favoriteGenre", e.target.value)
              }
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </label>
          <label style={{ fontSize: "0.9rem" }}>
            Bio
            <textarea
              value={profile.bio}
              onChange={(e) =>
                handleChange("bio", e.target.value)
              }
              rows={3}
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.35rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </label>
        </form>
      </div>

      {/* Listening overview + history */}
      <div
        style={{
          flex: "2 1 320px",
          minWidth: "280px",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
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
              marginBottom: "0.5rem",
            }}
          >
            Listening Overview
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            <OverviewStat label="Playlists" value={totalPlaylists} />
            <OverviewStat
              label="Playlist songs"
              value={totalPlaylistSongs}
            />
            <OverviewStat
              label="Unique tracks"
              value={uniqueTrackCount}
            />
            <OverviewStat
              label="Total plays (demo)"
              value={totalPlays}
            />
          </div>
        </div>

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
              marginBottom: "0.5rem",
            }}
          >
            Recent Listening History
          </h2>

          {listeningHistory.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              No plays recorded yet. Use the Play buttons in the song
              list or playlists to add to your history.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {listeningHistory.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    padding: "0.4rem 0.6rem",
                    background: "#fafafa",
                    fontSize: "0.9rem",
                  }}
                >
                  <div>
                    <strong>{entry.title}</strong>{" "}
                    <span style={{ color: "#666" }}>
                      - {entry.artist}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#555",
                    }}
                  >
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

function OverviewStat({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.85rem",
          color: "#555",
        }}
      >
        {label}
      </div>
    </div>
  );
}
