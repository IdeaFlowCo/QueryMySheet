import React, { useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useData } from "../context/DataContext";

const DataTable: React.FC = () => {
    const { headers, filteredRows } = useData();
    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const columns = useMemo<ColumnDef<string[]>[]>(() => {
        return headers.map((header, index) => ({
            id: String(index),
            header: header,
            accessorFn: (row) => row[index],
            size: 150,
        }));
    }, [headers]);

    const table = useReactTable({
        data: filteredRows,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 35,
        getScrollElement: () => tableContainerRef.current,
        overscan: 5,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();

    return (
        <div
            ref={tableContainerRef}
            style={{ height: "70vh", overflow: "auto" }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                    style={{
                        position: "sticky",
                        top: 0,
                        background: "white",
                        zIndex: 1,
                    }}
                >
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{
                                        width: header.getSize(),
                                        borderBottom: "1px solid #ddd",
                                        borderRight: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "left",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
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
                <tbody
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        position: "relative",
                    }}
                >
                    {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        return (
                            <tr
                                key={row.id}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        style={{
                                            width: cell.column.getSize(),
                                            padding: "8px",
                                            borderRight: "1px solid #ddd",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
