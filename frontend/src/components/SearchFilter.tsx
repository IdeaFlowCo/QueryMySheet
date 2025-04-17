import { useCallback, ChangeEvent } from "react";
import debounce from "lodash.debounce";
import { useData } from "../context/DataContext";

const SearchFilter = () => {
    const { runSearchQuery } = useData();

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
        <div style={{ marginBottom: "1rem" }}>
            <input
                type="text"
                placeholder="What are you looking for?"
                onChange={handleChange}
                style={{ width: "100%", padding: "0.5rem" }}
            />
        </div>
    );
};

export default SearchFilter;
