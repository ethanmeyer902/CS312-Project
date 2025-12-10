import { useContext } from "react";
import { PlayerContext } from "./PlayerContext.jsx";
import "./PlayerControls.css";

const AUDIO_URL = "http://localhost:5000/audio/dreams.mp3";

export default function PlayerControls() {
  const { play, pause, isPlaying, volume, setVolume } = useContext(PlayerContext);

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
  };

  return (
    <div className="player-controls">
      <button type="button" onClick={() => play(AUDIO_URL)}>
        {isPlaying ? "Restart" : "Play"}
      </button>
      <button type="button" onClick={pause}>
        Pause
      </button>

      {/* Stubs for future behavior */}
      <button type="button" disabled>
        Prev
      </button>
      <button type="button" disabled>
        Next
      </button>
      <button type="button" disabled>
        Shuffle
      </button>
      <button type="button" disabled>
        Loop
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
      />
    </div>
  );
}
