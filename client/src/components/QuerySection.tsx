import { useState, useRef, ChangeEvent, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuerySectionProps } from "../types";
import { Loader2, Search, Link, Upload, LinkIcon, UploadIcon } from "lucide-react";

export default function QuerySection({
  query,
  sheetUrl,
  file,
  fileName,
  isLoading,
  activeTab,
  onQueryChange,
  onSheetUrlChange,
  onFileChange,
  onTabChange,
  onSubmit,
}: QuerySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const queryUploadInputRef = useRef<HTMLInputElement>(null);

  // Handle cmd/ctrl+enter to submit
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      // Check if form is valid before submitting
      const canSubmit = activeTab === 'url' 
        ? (query && sheetUrl && !isLoading)
        : (query && file && !isLoading);
      
      if (canSubmit) {
        onSubmit();
      }
    }
  }, [activeTab, query, sheetUrl, file, isLoading, onSubmit]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
      
      // Auto-focus the query input after selecting a file for better workflow
      if (queryUploadInputRef.current && !query) {
        queryUploadInputRef.current.focus();
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
      
      // Auto-focus the query input after dropping a file
      if (queryUploadInputRef.current && !query) {
        queryUploadInputRef.current.focus();
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Auto trim whitespace from inputs
  const handleQueryChange = (value: string) => {
    onQueryChange(value.trimStart());
  };
  
  const handleUrlChange = (value: string) => {
    onSheetUrlChange(value.trim());
  };

  // Detect operating system for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;
  const shortcutKey = isMac ? 'Cmd+Enter' : 'Ctrl+Enter';
  
  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange(value as 'url' | 'upload')}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="url" className="flex items-center">
            <LinkIcon className="w-4 h-4 mr-2" />
            Google Sheet URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center">
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="query" className="block text-sm font-medium mb-1">
                What are you looking for?
              </Label>
              <Input
                id="query"
                ref={queryInputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., employees hired after 2020"
                className="py-3"
                autoFocus
              />
            </div>
            
            <div className="flex-1">
              <Label htmlFor="sheet-url" className="block text-sm font-medium mb-1">
                Google Sheet URL
              </Label>
              <Input
                id="sheet-url"
                ref={urlInputRef}
                value={sheetUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="py-3"
              />
            </div>
            
            <div className="self-end">
              <Button 
                onClick={onSubmit}
                disabled={isLoading || !query || !sheetUrl}
                className="h-12 px-6 relative group"
              >
                {isLoading ? 
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                  <Search className="mr-2 h-4 w-4" />
                }
                Go
                <span className="hidden md:inline-block absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Press {shortcutKey}
                </span>
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="query-upload" className="block text-sm font-medium mb-1">
                What are you looking for?
              </Label>
              <Input
                id="query-upload"
                ref={queryUploadInputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., sales numbers for Q1 2023"
                className="py-3"
              />
            </div>
            
            <div className="flex-1">
              <Label className="block text-sm font-medium mb-1">
                Upload Spreadsheet
              </Label>
              <div 
                className="flex items-center justify-center w-full"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <label 
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                    file ? 'border-primary border-solid' : 'border-gray-300 border-dashed'
                  } rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <svg 
                          className="w-8 h-8 mb-3 text-primary" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p className="mb-1 text-sm text-gray-500">{fileName}</p>
                      </>
                    ) : (
                      <>
                        <svg 
                          className="w-8 h-8 mb-3 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-1 text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">CSV, Excel or Google Sheets</p>
                      </>
                    )}
                  </div>
                  <input 
                    ref={fileInputRef}
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls,.ods,.numbers,.gsheet"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            
            <div className="self-end">
              <Button 
                onClick={onSubmit}
                disabled={isLoading || !query || !file}
                className="h-12 px-6 relative group"
              >
                {isLoading ? 
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                  <Search className="mr-2 h-4 w-4" />
                }
                Go
                <span className="hidden md:inline-block absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Press {shortcutKey}
                </span>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {isLoading && (
        <div className="mt-4 flex justify-center items-center py-4">
          <Loader2 className="animate-spin h-5 w-5 text-primary" />
          <span className="ml-2 text-sm text-gray-500">Analyzing your data...</span>
        </div>
      )}
    </div>
  );
}