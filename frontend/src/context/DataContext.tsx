import { createContext, useContext, useState, ReactNode } from "react";
import { runSearch } from "../utils/search";

interface DataContextType {
    headers: string[];
    rows: string[][];
    filteredRows: string[][];
    loading: boolean;
    setData: (headers: string[], rows: string[][]) => void;
    runSearchQuery: (
        query: string,
        searchHeaders: string[],
        searchRows: string[][]
    ) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within DataProvider");
    return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [filteredRows, setFilteredRows] = useState<string[][]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const setData = (newHeaders: string[], newRows: string[][]) => {
        setHeaders(newHeaders);
        setRows(newRows);
        setFilteredRows(newRows);
    };

    const runSearchQuery = async (
        query: string,
        searchHeaders: string[],
        searchRows: string[][]
    ) => {
        setLoading(true);
        try {
            if (!query) {
                setFilteredRows(searchRows);
                return;
            }
            const results = await runSearch(query, searchHeaders, searchRows);
            setFilteredRows(results);
        } catch (error) {
            console.error("Error during search:", error);
            setFilteredRows([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DataContext.Provider
            value={{
                headers,
                rows,
                filteredRows,
                loading,
                setData,
                runSearchQuery,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
