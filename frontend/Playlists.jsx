import PlaylistItem from "../components/Playlists/PlaylistItem";

export default function Playlists() {
  const sample = [
    { id: 1, name: "Chill Vibes" },
    { id: 2, name: "Workout Mix" }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Playlists</h2>
      {sample.map(list => (
        <PlaylistItem key={list.id} playlist={list} />
      ))}
    </div>
  );
}
