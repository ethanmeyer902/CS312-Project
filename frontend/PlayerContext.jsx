import { createContext, useState, useRef } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  const play = (url) => {
    audioRef.current.src = url;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{ play, pause, isPlaying }}>
      {children}
    </PlayerContext.Provider>
  );
}
