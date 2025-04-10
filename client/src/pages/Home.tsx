import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QuerySection from "@/components/QuerySection";
import ResultsSection from "@/components/ResultsSection";
import { QueryResult } from "@shared/schema";
import { InfoIcon, FileTextIcon, FileCode } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  
  // States
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [query, setQuery] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [originalResults, setOriginalResults] = useState<QueryResult[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Handle file change
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    // Auto-switch to upload tab when a file is directly dropped onto the page
    setActiveTab('upload');
  };
  
  // Global drag and drop handlers
  const handleGlobalDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if files are being dragged
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };
  
  const handleGlobalDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };
  
  const handleGlobalDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the document
    if (e.clientY <= 0 || e.clientX <= 0 || 
        e.clientX >= window.innerWidth || 
        e.clientY >= window.innerHeight) {
      setIsDraggingFile(false);
    }
  };
  
  const handleGlobalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    
    // Check if files are being dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check if it's a supported file type
      const supportedTypes = ['.csv', '.xlsx', '.xls', '.ods', '.numbers', '.gsheet'];
      const fileExtension = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (supportedTypes.some(ext => fileExtension.includes(ext))) {
        handleFileChange(droppedFile);
      } else {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a CSV or spreadsheet file.",
          variant: "destructive",
        });
      }
    }
  };

  // Mutation for processing the query
  const processQueryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/query', formData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setOriginalResults(data.results);
        setIsFiltered(true);
      } else {
        setResults([]);
        toast({
          title: "No results found",
          description: "Try adjusting your query or check your data source.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error processing query",
        description: error.message || "Please try again or check your inputs.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!query) {
        toast({
          title: "Query Required",
          description: "Please enter what you're looking for.",
          variant: "destructive",
        });
        return;
      }

      if (activeTab === 'url' && !sheetUrl) {
        toast({
          title: "Google Sheet URL Required",
          description: "Please enter a valid Google Sheet URL.",
          variant: "destructive",
        });
        return;
      }

      if (activeTab === 'upload' && !file) {
        toast({
          title: "File Required",
          description: "Please upload a spreadsheet file.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('query', query);
      // Hardcoded values instead of user inputs
      formData.append('model', 'gpt-4o-mini');
      formData.append('temperature', '0.3');
      
      if (activeTab === 'url') {
        formData.append('sheetUrl', sheetUrl);
      } else if (file) {
        formData.append('file', file);
      }

      processQueryMutation.mutate(formData);
    } catch (error) {
      console.error("Error submitting query:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setIsFiltered(false);
    setResults(originalResults);
  };

  // Handle export results
  const handleExport = () => {
    if (!results.length) return;

    // Generate CSV from results
    const columns = Object.keys(results[0].cells);
    const csvContent = [
      // Header row
      columns.join(','),
      // Data rows
      ...results.map((row) => 
        columns.map((col) => {
          // Escape commas and quotes in cell values
          const cellValue = row.cells[col] || '';
          return `"${cellValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query-results-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="container mx-auto px-4 py-8 max-w-6xl relative"
      onDragEnter={handleGlobalDragEnter}
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* File drop overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center rounded-lg z-50 border-2 border-dashed border-primary animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 text-primary">
              <svg 
                className="w-16 h-16" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your spreadsheet file</h3>
            <p className="text-gray-500">Release to upload your CSV or Excel file</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <FileTextIcon className="w-8 h-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">QueryMySheet</h1>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-primary hover:text-primary-dark text-sm flex items-center">
            <InfoIcon className="w-4 h-4 mr-1" />
            How it works
          </a>
          <a 
            href="https://github.com/yourusername/querymysheet" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark text-sm flex items-center"
          >
            <FileCode className="w-4 h-4 mr-1" />
            GitHub
          </a>
        </div>
      </header>

      {/* Intro Section */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-gray-700 mb-2">
          Query your spreadsheets using natural language
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          This tool lets you ask questions about your data in plain English and get instant results.
        </p>
      </div>

      {/* Query Section */}
      <QuerySection
        query={query}
        sheetUrl={sheetUrl}
        file={file}
        fileName={fileName}
        isLoading={processQueryMutation.isPending}
        activeTab={activeTab}
        onQueryChange={setQuery}
        onSheetUrlChange={setSheetUrl}
        onFileChange={handleFileChange}
        onTabChange={setActiveTab}
        onSubmit={handleSubmit}
      />

      {/* Results Section */}
      {results.length > 0 && (
        <ResultsSection
          results={results}
          isFiltered={isFiltered}
          matchCount={results.length}
          onClearFilter={handleClearFilter}
          onExport={handleExport}
        />
      )}

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm">
        <p>
          QueryMySheet is an open-source project.{" "}
          <a 
            href="https://github.com/yourusername/querymysheet" 
            className="text-primary hover:text-primary-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
