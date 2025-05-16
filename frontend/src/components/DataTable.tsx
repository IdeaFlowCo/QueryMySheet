import React, { useMemo, useRef } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import { useData } from "../context/DataContext";
import "./DataTable.css";

const DataTable: React.FC = () => {
    const { headers, filteredRows, loading } = useData();
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const columns = useMemo<ColumnDef<string[]>[]>(() => {
        return headers.map((header, index) => {
            const lowerHeader = header.toLowerCase().trim();
            let colSize = 150; // Default size for most columns

            // Prioritize the problematic column with a larger fixed size
            if (
                lowerHeader === "annual co₂ emissions" ||
                lowerHeader === "annual co2 emissions"
            ) {
                colSize = 280; // Generous size for this specific header
            } else if (header.length > 20) {
                colSize = 220; // For other long headers
            } else if (header.length < 6 && headers.length > 3) {
                colSize = 100; // Shorter headers if there are multiple columns
            }

            return {
                id: String(index),
                header: header,
                accessorFn: (row) => row[index],
                size: colSize,
                minSize: 80, // Minimum width to maintain readability
                maxSize: 400, // Maximum width to prevent overly wide columns
            };
        });
    }, [headers]);

    const table = useReactTable({
        data: filteredRows,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const { rows } = table.getRowModel();

    if (loading) {
        return (
            <div className="loading-indicator">
                <div className="spinner"></div>
                finding results...
            </div>
        );
    }

    if (!loading && filteredRows.length === 0 && headers.length > 0) {
        return (
            <div className="message-indicator">
                No results found for your query.
            </div>
        );
    }

    if (headers.length === 0) {
        return (
            <div className="message-indicator">
                Load data using the options above.
            </div>
        );
    }

    return (
        <div ref={tableContainerRef} className="table-container">
            <table className="data-table">
                <thead className="table-header">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{ width: header.getSize() }}
                                    className="table-header-cell"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="table-body">
                    {rows.map((row, idx) => (
                        <tr
                            key={row.id}
                            className={`table-row ${idx % 2 ? "odd" : "even"}`}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="table-cell"
                                    style={{ width: cell.column.getSize() }}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
