import { QueryResult } from "@shared/schema";

export interface TabsState {
  activeTab: 'url' | 'upload';
}

export interface QueryState {
  query: string;
  sheetUrl: string;
  file: File | null;
  fileName: string;
}

export interface ApiConfigState {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface ResultsState {
  results: QueryResult[];
  originalResults: QueryResult[];
  isFiltered: boolean;
  totalCount: number;
  matchCount: number;
}

export interface QuerySectionProps {
  query: string;
  sheetUrl: string;
  file: File | null;
  fileName: string;
  isLoading: boolean;
  activeTab: 'url' | 'upload';
  onQueryChange: (query: string) => void;
  onSheetUrlChange: (url: string) => void;
  onFileChange: (file: File) => void;
  onTabChange: (tab: 'url' | 'upload') => void;
  onSubmit: () => void;
}

export interface ResultsSectionProps {
  results: QueryResult[];
  isFiltered: boolean;
  matchCount: number;
  onClearFilter: () => void;
  onExport: () => void;
}

export interface ApiKeySectionProps {
  apiKey: string;
  model: string;
  temperature: number;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  onTemperatureChange: (temp: number) => void;
}
