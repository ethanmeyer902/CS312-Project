import { createContext, useState, useRef, useEffect } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const play = (url) => {
    if (url) {
      audioRef.current.src = url;
    }
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.error("Audio play error:", err);
    });
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const setPlayerVolume = (value) => {
    const v = Math.min(1, Math.max(0, value));
    setVolume(v);
  };

  return (
    <PlayerContext.Provider
      value={{ play, pause, isPlaying, volume, setVolume: setPlayerVolume }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
