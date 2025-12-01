import "./PlaylistItem.css";

export default function PlaylistItem({ playlist }) {
  return (
    <div className="playlist-item">
      <p>{playlist.name}</p>
    </div>
  );
}
