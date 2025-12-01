import SearchBar from "../components/Search/SearchBar";
import SearchFilters from "../components/Search/SearchFilters";
import "./Search.css";

export default function Search() {
  return (
    <div className="search-page">
      <SearchBar />
      <SearchFilters />
    </div>
  );
}
