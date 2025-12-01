import { useContext, useState } from "react";
import { PlayerContext } from "../../context/PlayerContext";
import "./PlayerControls.css";

export default function PlayerControls() {
  const { play, pause, isPlaying } = useContext(PlayerContext);
  const [volume, setVolume] = useState(1);

  return (
    <div className="player-controls">
      <button onClick={() => play("/sample.mp3")}>Play</button>
      <button onClick={pause}>Pause</button>

      <button>Prev</button>
      <button>Next</button>

      <button>Shuffle</button>
      <button>Loop</button>

      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />
    </div>
  );
}
