// import logoSrc from '/src/assets/logo.png'; // Remove unused import
import "./App.css";
import { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";
import { DataProvider, useData } from "@/context/DataContext";
import QuerySection from "@/components/QuerySection";
import DataTable from "@/components/DataTable";
import HowItWorksModal from "@/components/HowItWorksModal"; // Import the modal component
import { HelpCircle } from "lucide-react"; // Import the HelpCircle icon
// Placeholder icons - consider using an icon library like react-icons
// const GithubIcon = () => <svg>...</svg>; // Commented out for now
// const InfoIcon = () => <svg>...</svg>; // Commented out for now

// Define the main layout and logic component
function AppLayout() {
    const { setData, runSearchQuery } = useData();
    const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
    const [query, setQuery] = useState<string>("");
    const [sheetUrl, setSheetUrl] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingSpreadsheet, setIsLoadingSpreadsheet] =
        useState<boolean>(false);
    const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] =
        useState<boolean>(false); // State for modal visibility

    const handleTabChange = (value: "url" | "upload") => {
        setActiveTab(value);
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
    };

    const handleSheetUrlChange = (value: string) => {
        setSheetUrl(value);
    };

    const handleFileChange = (newFile: File | null) => {
        setFile(newFile);
        setFileName(newFile ? newFile.name : null);
    };

    const parseAndSetData = (
        dataToParse: string[][] | string
    ): { success: boolean; headers?: string[]; rows?: string[][] } => {
        try {
            let parsedData: string[][] | null = null;
            if (typeof dataToParse === "string") {
                const results: ParseResult<string[]> = Papa.parse<string[]>(
                    dataToParse,
                    { skipEmptyLines: true }
                );
                parsedData = results.data;
            } else {
                parsedData = dataToParse;
            }

            if (!parsedData || parsedData.length < 1) {
                alert("Sheet appears to be empty or inaccessible.");
                return { success: false };
            }
            const headers = parsedData[0];
            const rows = parsedData.slice(1);
            setData(headers, rows);
            return { success: true, headers, rows };
        } catch (error) {
            alert(
                `Failed to parse data. Error: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            return { success: false };
        }
    };

    // Function to open the modal
    const openHowItWorksModal = () => {
        setIsHowItWorksModalOpen(true);
    };

    // Function to close the modal
    const closeHowItWorksModal = () => {
        setIsHowItWorksModalOpen(false);
    };

    const handleSubmit = async () => {
        setIsLoadingSpreadsheet(true);
        setData([], []);
        let parsedResult: {
            success: boolean;
            headers?: string[];
            rows?: string[][];
        } = {
            success: false,
        };
        setIsLoading(false);

        if (activeTab === "url") {
            if (
                !sheetUrl ||
                !sheetUrl.startsWith("https://docs.google.com/spreadsheets/d/")
            ) {
                alert("Please enter a valid Google Sheets URL.");
                setIsLoadingSpreadsheet(false);
                return;
            }
            // Extract gid from sheetUrl
            let gid = null;
            try {
                const url = new URL(sheetUrl);
                const params = new URLSearchParams(url.hash.substring(1)); // Prefer hash for gid
                gid = params.get("gid");
                if (!gid && url.search) {
                    // Fallback to search params if not in hash
                    const searchParams = new URLSearchParams(url.search);
                    gid = searchParams.get("gid");
                }
            } catch (e) {
                //Silently ignore an invalid URL, the replace will handle it or error later
                console.warn("Could not parse GID from URL", e);
            }

            let csvUrl = sheetUrl.replace(/\/edit.*$/, "/export?format=csv");
            if (gid) {
                csvUrl += `&gid=${gid}`;
            }
            try {
                const res = await fetch(csvUrl);
                if (!res.ok)
                    throw new Error(`Failed to fetch sheet: ${res.statusText}`);
                const text = await res.text();
                parsedResult = parseAndSetData(text);
            } catch (error) {
                alert(
                    `Failed to load data from URL. Check permissions. Error: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
        } else if (activeTab === "upload" && file) {
            const ext = file.name.split(".").pop()?.toLowerCase();
            try {
                if (ext === "csv") {
                    const text = await file.text();
                    parsedResult = parseAndSetData(text);
                } else if (ext === "xls" || ext === "xlsx") {
                    const fileData = await file.arrayBuffer();
                    const workbook = XLSX.read(new Uint8Array(fileData), {
                        type: "array",
                        raw: false,
                    });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json<string[]>(worksheet, {
                        header: 1,
                        raw: false,
                    });
                    parsedResult = parseAndSetData(json);
                } else {
                    alert("Unsupported file type.");
                }
            } catch (error) {
                alert(
                    `Failed to process file. Error: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
        }

        setIsLoadingSpreadsheet(false);

        if (parsedResult.success && parsedResult.headers && parsedResult.rows) {
            if (query.trim() === "") {
                setIsLoading(false);
            } else {
                // Wrap the search call in try...finally to ensure isLoading is reset
                try {
                    setIsLoading(true);
                    await runSearchQuery(
                        query,
                        parsedResult.headers,
                        parsedResult.rows
                    );
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            setIsLoading(false);
        }
    };

    return (
        // Apply class name for App Layout
        <div className="app-layout">
            {/* Apply class name for Header */}
            <header className="app-header">
                {/* Apply class name for Header Content */}
                <div className="header-content">
                    {/* Apply class name for Logo/Title */}
                    <div className="logo-title">
                        <svg // Placeholder SVG - Add relevant path
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            ></path>
                        </svg>
                        QueryMySheet
                    </div>
                    {/* Apply class name for Nav */}
                    <nav className="app-nav">
                        {/* Change link to button triggering the modal */}
                        <button
                            onClick={openHowItWorksModal}
                            className="nav-link"
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            <HelpCircle strokeWidth={2.5} />
                            How it works
                        </button>
                        {/* Apply class name for Nav Link */}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://github.com/IdeaFlowCo/QueryMySheet"
                            className="nav-link"
                        >
                            <svg // Placeholder SVG - Add relevant path
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                            GitHub
                        </a>
                    </nav>
                </div>
            </header>

            {/* Apply class name for Main Content */}
            <main className="main-content">
                {/* Apply class name for Intro Section */}
                <div className="intro-section">
                    <h1>Query your spreadsheets using natural language</h1>
                    <p>
                        This tool lets you ask questions about your data in
                        plain English and get instant results.
                    </p>
                </div>

                <QuerySection
                    query={query}
                    sheetUrl={sheetUrl}
                    file={file}
                    fileName={fileName}
                    isLoading={isLoading}
                    activeTab={activeTab}
                    onQueryChange={handleQueryChange}
                    onSheetUrlChange={handleSheetUrlChange}
                    onFileChange={handleFileChange}
                    onTabChange={handleTabChange}
                    onSubmit={handleSubmit}
                    isLoadingSpreadsheet={isLoadingSpreadsheet}
                />

                <DataTable />
            </main>

            {/* Apply class name for Footer */}
            <footer className="app-footer">
                {/* Apply class name for Footer Content */}
                <div className="footer-content">
                    <p>
                        QueryMySheet is an open-source project.{" "}
                        {/* Apply class name for Footer Link */}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://github.com/IdeaFlowCo/QueryMySheet"
                            className="footer-link"
                        >
                            <svg // Placeholder SVG - Add relevant path
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                            View on GitHub
                        </a>
                    </p>
                    <p>
                        Built with AI assistance • MIT License • No data is
                        stored
                    </p>
                </div>
            </footer>

            {/* Conditionally render the modal */}
            <HowItWorksModal
                isOpen={isHowItWorksModalOpen}
                onClose={closeHowItWorksModal}
            />
        </div>
    );
}

// App component now just sets up the provider
function App() {
    return (
        <DataProvider>
            <AppLayout />
        </DataProvider>
    );
}

export default App;
