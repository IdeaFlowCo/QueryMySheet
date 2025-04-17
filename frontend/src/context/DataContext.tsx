import { createContext, useContext, useState, ReactNode } from "react";
import { runSearch } from "../utils/search";

interface DataContextType {
    headers: string[];
    rows: string[][];
    filteredRows: string[][];
    setData: (headers: string[], rows: string[][]) => void;
    runSearchQuery: (query: string) => Promise<void>;
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

    const setData = (newHeaders: string[], newRows: string[][]) => {
        setHeaders(newHeaders);
        setRows(newRows);
        setFilteredRows(newRows);
    };

    const runSearchQuery = async (query: string) => {
        if (!query) {
            setFilteredRows(rows);
            return;
        }
        const results = await runSearch(query, headers, rows);
        setFilteredRows(results);
    };

    return (
        <DataContext.Provider
            value={{ headers, rows, filteredRows, setData, runSearchQuery }}
        >
            {children}
        </DataContext.Provider>
    );
};
