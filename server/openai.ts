import OpenAI from "openai";

const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({ apiKey });
};

interface AnalyzeSpreadsheetParams {
  query: string;
  content: string;
  model: string;
  temperature: number;
  apiKey: string;
}

export async function analyzeSpreadsheet({
  query,
  content,
  model = "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  temperature = 0.3,
  apiKey,
}: AnalyzeSpreadsheetParams) {
  const openai = createOpenAIClient(apiKey);

  const prompt = `
You are an expert data analyst tasked with finding the most relevant entries in a spreadsheet based on a user query.

The spreadsheet content is provided as a CSV format below:
\`\`\`
${content}
\`\`\`

The user's query is: "${query}"

Analyze the spreadsheet and identify the rows that best match the query. For each matching row:
1. Determine why it matches the query
2. Extract the relevant columns and their values
3. Assign a relevance score based on how well it matches

Return your results in the following JSON format:
{
  "results": [
    {
      "rowNumber": number,
      "cells": {
        "columnName1": "value1",
        "columnName2": "value2",
        ...
      },
      "highlighted": true,
      "matchReason": "A brief explanation of why this row matches the query"
    }
  ],
  "explanation": "Brief explanation of your analysis approach"
}

If no matches are found, return an empty results array.
Return at most 10 most relevant results.
`;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: parseFloat(temperature.toString()),
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("OpenAI API returned empty response");
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`Failed to analyze spreadsheet: ${error.message}`);
  }
}
