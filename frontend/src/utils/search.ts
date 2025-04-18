import openai from "../openaiClient";

const CHUNK_SIZE = 100; // Process 100 rows per API call

/**
 * Processes a single chunk of rows, sending it to the LLM and returning the
 * 1-based indices relevant to the original dataset.
 */
const processChunk = async (
    query: string,
    headers: string[],
    chunkRows: string[][],
    chunkStartIndex: number // 0-based index of the first row in this chunk
): Promise<number[]> => {
    // Prepare data for the prompt using original 1-based indexing for rows
    const formattedHeaders = JSON.stringify(headers);
    const formattedRows = chunkRows
        .map(
            (row, index) =>
                `Row ${chunkStartIndex + index + 1}: ${JSON.stringify(row)}`
        )
        .join("\n");

    // Use the same refined prompt, but with chunked data
    const prompt = `Instructions:
1. Analyze the provided spreadsheet data (Headers and Rows) in relation to the User Query.
2. For EACH row, calculate a relevance score from 0.0 to 1.0 indicating how well it matches the query.
3. Identify the row indices (1-based) that have a relevance score STRICTLY GREATER THAN OR EQUAL TO 0.7.
4. Return ONLY a JSON array containing these 1-based row indices.
6. Respond ONLY with the JSON array, without any additional text or markdown formatting.

Headers: ${formattedHeaders}
Rows:
${formattedRows}
User Query: ${query}

Output:`;

    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4.1-mini-2025-04-14",
            messages: [{ role: "user", content: prompt }],
            // Consider adding a timeout if needed, e.g., timeout: 60000 (60 seconds)
        });

        const content = resp.choices?.[0]?.message?.content?.trim() || "";

        if (!content) {
            return [];
        }

        let chunkIndices: number[] = [];
        try {
            const cleanedContent = content.replace(/```json|```/g, "").trim();

            // Ensure the response is actually a JSON array before parsing
            if (
                !cleanedContent.startsWith("[") ||
                !cleanedContent.endsWith("]")
            ) {
                // Attempt to find numbers if it's just a list
                const numbers = cleanedContent.match(/\d+/g);
                if (numbers) {
                    chunkIndices = numbers.map(Number).filter((n) => !isNaN(n));
                } else {
                    return []; // Not a JSON array and couldn't find numbers
                }
            } else {
                chunkIndices = JSON.parse(cleanedContent);
            }

            if (!Array.isArray(chunkIndices)) {
                throw new Error("Parsed content is not a valid array.");
            }

            // Validate indices: must be numbers and within the original row range processed by this chunk
            const chunkEndIndex = chunkStartIndex + chunkRows.length; // Exclusive end index
            const validIndices = chunkIndices.filter((index) => {
                const isNumber = typeof index === "number" && !isNaN(index);
                const isInRange =
                    index >= chunkStartIndex + 1 && index <= chunkEndIndex + 1; // Check against 1-based original indices
                return isNumber && isInRange;
            });

            return validIndices; // Return the validated, original 1-based indices
        } catch (parseError) {
            console.error(
                `[Chunk ${
                    chunkStartIndex / CHUNK_SIZE + 1
                }] Failed to parse LLM response:`,
                parseError,
                "Raw content:",
                content
            );
            return [];
        }
    } catch (error) {
        console.error(
            `[Chunk ${
                chunkStartIndex / CHUNK_SIZE + 1
            }] Error during API call:`,
            error
        );
        return []; // Return empty array on chunk error
    }
};

export const runSearch = async (
    query: string,
    headers: string[],
    rows: string[][]
): Promise<string[][]> => {
    if (!query) {
        return rows;
    }

    const numChunks = Math.ceil(rows.length / CHUNK_SIZE);
    if (numChunks === 0) {
        return [];
    }

    const chunkPromises: Promise<number[]>[] = [];
    for (let i = 0; i < numChunks; i++) {
        const chunkStartIndex = i * CHUNK_SIZE;
        const chunkEndIndex = chunkStartIndex + CHUNK_SIZE; // Slice exclusive end index
        const chunkRows = rows.slice(chunkStartIndex, chunkEndIndex);

        // Add promise for processing this chunk
        chunkPromises.push(
            processChunk(query, headers, chunkRows, chunkStartIndex)
        );
    }

    // Process chunks in parallel
    const results = await Promise.allSettled(chunkPromises);

    // Aggregate indices from successful chunks
    let allIndices: number[] = [];
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            allIndices = allIndices.concat(result.value);
        } else {
            // Log reason for failure (Consider keeping this error log)
            console.error(`[Chunk ${index + 1}] Failed:`, result.reason);
        }
    });

    // Remove duplicates and sort the aggregated indices
    const uniqueIndices = [...new Set(allIndices)].sort((a, b) => a - b);

    // Filter original rows based on the final unique, 1-based indices
    const filteredRows = uniqueIndices
        .map((index) => {
            const zeroBasedIndex = index - 1;
            if (zeroBasedIndex < 0 || zeroBasedIndex >= rows.length) {
                return undefined;
            }
            return rows[zeroBasedIndex]; // Convert 1-based index to 0-based
        })
        .filter((row): row is string[] => row !== undefined); // Filter out undefined entries

    return filteredRows;
};
