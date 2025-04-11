declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: Array<{
      type: string;
      code: string;
      message: string;
      row: number;
    }>;
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
      fields?: string[];
    };
  }

  export interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    fastMode?: boolean;
    withCredentials?: boolean;
    delimitersToGuess?: string[];
    chunk?: (results: ParseResult<any>, parser: any) => void;
    complete?: (results: ParseResult<any>, file: any) => void;
    error?: (error: Error, file: any) => void;
    transform?: (value: string, field: string | number) => any;
  }

  export interface UnparseConfig {
    quotes?: boolean | boolean[] | Function;
    quoteChar?: string;
    escapeChar?: string;
    delimiter?: string;
    header?: boolean;
    newline?: string;
    skipEmptyLines?: boolean;
    columns?: string[] | Function;
  }

  export function parse<T>(csv: string | File, config?: ParseConfig): ParseResult<T>;
  export function unparse(data: any, config?: UnparseConfig): string;
}