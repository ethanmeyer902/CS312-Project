import { useState, useEffect } from "react";
import "./App.css";

import PlaylistPage from "./PlaylistPage.jsx";
import Login from "../Login.jsx";
import Register from "../Register.jsx";
import Search from "../Search.jsx";
import PlayerControls from "../PlayerControls.jsx";
import { PlayerProvider } from "../PlayerContext.jsx";

const API_BASE = "http://localhost:5000";

export default function App() {
  const [page, setPage] = useState("login");

  // Persist token + user so refresh keeps you signed in
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("musicapp_token");
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("musicapp_user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthed = !!token && !!user;

  useEffect(() => {
    if (isAuthed && (page === "login" || page === "register")) {
      setPage("library");
    }
  }, [isAuthed, page]);

  function handleLoginSuccess({ token, user }) {
    setToken(token);
    setUser(user);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("musicapp_token", token);
      window.localStorage.setItem("musicapp_user", JSON.stringify(user));
    }

    setPage("library");
  }

  function handleLogout() {
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("musicapp_token");
      window.localStorage.removeItem("musicapp_user");
    }

    setPage("login");
  }

  function renderContent() {
    // Not logged in: show Login/Register
    if (!isAuthed) {
      if (page === "register") {
        return (
          <div className="auth-wrapper">
            <Register apiBase={API_BASE} onSignupSuccess={handleLoginSuccess} />
            <p style={{ marginTop: "1rem" }}>
              Already have an account?{" "}
              <button type="button" onClick={() => setPage("login")}>
                Go to Login
              </button>
            </p>
          </div>
        );
      }

      return (
        <div className="auth-wrapper">
          <Login apiBase={API_BASE} onLoginSuccess={handleLoginSuccess} />
          <p style={{ marginTop: "1rem" }}>
            Need an account?{" "}
            <button type="button" onClick={() => setPage("register")}>
              Create one
            </button>
          </p>
        </div>
      );
    }

    // Logged-in views
    switch (page) {
      case "library":
        // Playlists + browse only
        return (
          <PlaylistPage
            key="library-view"
            user={user}
            initialTab="playlists"
            hideInnerTabs={true}
          />
        );

      case "search":
        return <Search />;

      case "profile":
        // Profile & history view
        return (
          <PlaylistPage
            key="profile-view"
            user={user}
            initialTab="dashboard"
            hideInnerTabs={true}
          />
        );

      default:
        return (
          <PlaylistPage
            key="library-default"
            user={user}
            initialTab="playlists"
            hideInnerTabs={true}
          />
        );
    }
  }

  return (
    <PlayerProvider>
      <div className="app-shell">
        <header className="top-bar">
          <div className="logo-text">MusicStream</div>
          {isAuthed && (
            <nav className="nav">
              <button type="button" onClick={() => setPage("library")}>
                Library
              </button>
              <button type="button" onClick={() => setPage("search")}>
                Search
              </button>
              <button type="button" onClick={() => setPage("profile")}>
                Profile
              </button>
              <span className="nav-spacer" />
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </nav>
          )}
        </header>

        <main className="main-content">{renderContent()}</main>

        <footer className="player-bar">
          <PlayerControls />
        </footer>
      </div>
    </PlayerProvider>
  );
}
