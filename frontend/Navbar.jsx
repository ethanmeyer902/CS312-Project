import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">MusicStream</h2>
      <ul className="nav-links">
        <li><Link to="/playlists">Playlists</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}
