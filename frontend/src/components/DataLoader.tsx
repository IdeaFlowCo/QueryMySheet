import React, { ChangeEvent } from "react";
import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";
import { useData } from "../context/DataContext";

const DataLoader = () => {
    const { setData } = useData();

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split(".").pop()?.toLowerCase();

        if (ext === "csv") {
            Papa.parse<string[]>(file, {
                skipEmptyLines: true,
                complete: (results: ParseResult<string[]>) => {
                    const data = results.data;
                    if (data.length < 1) return;
                    const headers = data[0];
                    const rows = data.slice(1);
                    setData(headers, rows);
                },
            });
        } else if (ext === "xls" || ext === "xlsx") {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<string[]>(worksheet, {
                    header: 1,
                    raw: false,
                });
                if (json.length < 1) return;
                const [headers, ...rows] = json;
                setData(headers as string[], rows as string[][]);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleURL = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const input = form.elements.namedItem("sheetUrl") as HTMLInputElement;
        const url = input.value;
        if (!url) return;
        const csvUrl = url.replace(/\/edit.*$/, "/export?format=csv");
        const res = await fetch(csvUrl);
        const text = await res.text();
        const results: ParseResult<string[]> = Papa.parse<string[]>(text, {
            skipEmptyLines: true,
        });
        const data = results.data;
        if (data.length < 1) return;
        const headers = data[0];
        const rows = data.slice(1);
        setData(headers, rows);
    };

    return (
        <div style={{ marginBottom: "1rem" }}>
            <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFile} />
            <form
                onSubmit={handleURL}
                style={{ display: "inline-block", marginLeft: "1rem" }}
            >
                <input
                    type="text"
                    name="sheetUrl"
                    placeholder="Enter Google Sheet URL"
                />
                <button type="submit">Load</button>
            </form>
        </div>
    );
};

export default DataLoader;
