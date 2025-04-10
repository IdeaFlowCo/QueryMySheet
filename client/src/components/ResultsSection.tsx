import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResultsSectionProps } from "../types";
import { Download } from "lucide-react";

export default function ResultsSection({
  results,
  isFiltered,
  matchCount,
  onClearFilter,
  onExport
}: ResultsSectionProps) {
  if (!results || results.length === 0) {
    return null;
  }

  // Extract column headers from the first result
  const firstResult = results[0];
  const columns = Object.keys(firstResult.cells || {});

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-xl font-semibold text-gray-900">{matchCount} {matchCount === 1 ? 'Match' : 'Matches'}</h3>
          {isFiltered && (
            <button 
              type="button" 
              className="ml-4 text-sm text-gray-500 hover:text-gray-700"
              onClick={onClearFilter}
            >
              Clear Filter
            </button>
          )}
        </div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="max-h-[calc(100vh-270px)] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                {columns.map((column) => (
                  <TableHead key={column}>
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-all">
                  <TableCell className="whitespace-nowrap text-gray-500">
                    {row.rowNumber || index + 1}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell 
                      key={column} 
                      className={`${column === 'Bio' || column === 'bio' || column === 'description' || column === 'notes' ? '' : 'whitespace-nowrap'} ${row.highlighted ? 'font-medium' : ''}`}
                    >
                      {row.highlighted && row.matchReason && (column === 'Bio' || column === 'bio' || column === 'description' || column === 'notes') ? (
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          {row.cells[column] || ''}
                        </div>
                      ) : (
                        row.cells[column] || ''
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
