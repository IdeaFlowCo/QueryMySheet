import openai from "../openaiClient";

export const runSearch = async (
    query: string,
    headers: string[],
    rows: string[][]
): Promise<string[][]> => {
    if (!query) {
        console.log("Empty query, returning all rows.");
        return rows;
    }

    // Prepare data for the prompt (1-based indexing for rows)
    const formattedHeaders = JSON.stringify(headers);
    const formattedRows = rows
        .map((row, index) => `Row ${index + 1}: ${JSON.stringify(row)}`)
        .join("\n");

    const prompt = `instructions: find rows related to the user's query. consider each row individually and how relevant it is. come up with a relevance score from 0.0-1.0.
Headers: ${formattedHeaders}
Rows:\n${formattedRows}
Query: find me events related to '${query}'.
Output: your output should be a JSON array of row indices, 1-indexed. eg [1,2,3,4...] Only return indices that match the query. You could measure this by any results with a relevance score of 0.7 or greater. Respond ONLY with the JSON array.`;

    console.log("Sending prompt to LLM:", prompt);

    try {
        const resp = await openai.chat.completions.create({
            // Assuming a model compatible with the prompt structure
            // You might need to adjust the model name based on availability
            model: "gpt-4.1-mini-2025-04-14", // Updated model
            messages: [{ role: "user", content: prompt }],
            // Adjust temperature/max_tokens if needed
            // temperature: 0.2,
        });

        const content = resp.choices?.[0]?.message?.content?.trim() || "";
        console.log("Received LLM response:", content);

        if (!content) {
            console.error("LLM returned empty content.");
            // Fallback or specific error handling needed here
            // For now, returning empty results on error
            return [];
        }

        // Attempt to parse the JSON array response
        let indices: number[] = [];
        try {
            // Clean potential markdown fences
            const cleanedContent = content.replace(/```json|```/g, "").trim();
            indices = JSON.parse(cleanedContent);
            if (!Array.isArray(indices) || indices.some(isNaN)) {
                throw new Error(
                    "Parsed content is not a valid array of numbers."
                );
            }
        } catch (parseError) {
            console.error(
                "Failed to parse LLM response as JSON array:",
                parseError,
                "Raw content:",
                content
            );
            // Fallback or specific error handling needed here
            // For now, returning empty results on error
            return [];
        }

        console.log("Parsed indices (1-based):", indices);

        // Filter rows based on the 1-based indices from the LLM
        const filteredRows = indices
            .map((index) => rows[index - 1]) // Convert 1-based index to 0-based
            .filter((row) => row !== undefined); // Filter out potential undefined entries if index is out of bounds

        console.log("Filtered rows count:", filteredRows.length);
        return filteredRows;
    } catch (error) {
        console.error("Error during LLM search:", error);
        // Fallback or specific error handling needed here
        // For now, returning empty results on error
        return [];
    }
};
