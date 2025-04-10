import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuerySectionProps } from "../types";
import { Loader2 } from "lucide-react";

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange(value as 'url' | 'upload')}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="url">Google Sheet URL</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="query" className="block text-sm font-medium mb-1">
                What are you looking for?
              </Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Looking for full stack engineer"
                className="py-3"
              />
            </div>
            
            <div className="flex-1">
              <Label htmlFor="sheet-url" className="block text-sm font-medium mb-1">
                Google Sheet URL
              </Label>
              <Input
                id="sheet-url"
                value={sheetUrl}
                onChange={(e) => onSheetUrlChange(e.target.value)}
                placeholder="https://sheets.google.com/..."
                className="py-3"
              />
            </div>
            
            <div className="self-end">
              <Button 
                onClick={onSubmit}
                disabled={isLoading || !query || !sheetUrl}
                className="h-12 px-6"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Go
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
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Looking for full stack engineer"
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
                className="h-12 px-6"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Go
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
