import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navigation/Navbar";
import { PlayerProvider } from "./context/PlayerContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Playlists from "./pages/Playlists";
import Search from "./pages/Search";

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
