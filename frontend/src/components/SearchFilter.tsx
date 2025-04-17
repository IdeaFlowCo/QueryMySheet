import { useCallback, ChangeEvent } from "react";
import debounce from "lodash.debounce";
import { useData } from "../context/DataContext";

const SearchFilter = () => {
    const { runSearchQuery, loading } = useData();

    const debouncedSearch = useCallback(
        debounce((q: string) => {
            runSearchQuery(q);
        }, 300),
        [runSearchQuery]
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };

    return (
        <div
            className="search-filter-container"
            style={{ marginBottom: "1.5rem" }}
        >
            <label htmlFor="search-input">What are you looking for?</label>
            <input
                id="search-input"
                type="text"
                placeholder="e.g., employees hired after 2020"
                onChange={handleChange}
                disabled={loading}
            />
        </div>
    );
};

export default SearchFilter;
