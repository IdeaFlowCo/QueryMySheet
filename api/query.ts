import { Request, Response } from "express";
import multer from "multer";
import { fetchGoogleSheet, parseUploadedFile } from "../server/sheets";
import { analyzeSpreadsheet } from "../server/openai";

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });
const multerAny = upload.any();

// Wrap multer middleware for API route
const runMiddleware = (
    req: Request & { files?: Express.Multer.File[] },
    res: Response,
    fn: Function
) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export default async function handler(
    req: Request & { files?: Express.Multer.File[] },
    res: Response
) {
    console.log(
        `[api/query] Received request: Method=${req.method}, URL=${req.url}`
    );
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    // Handle OPTIONS request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only handle POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Handle file uploads
        await runMiddleware(req, res, multerAny);

        const { query, sheetUrl, apiKey, model, temperature } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        if (!apiKey) {
            return res.status(400).json({ error: "API key is required" });
        }

        let content = "";

        // Process file upload if present
        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            try {
                content = await parseUploadedFile(file);
            } catch (error) {
                return res.status(400).json({
                    error: `Unable to parse uploaded file: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                });
            }
        }
        // Process Google Sheet URL if provided
        else if (sheetUrl) {
            try {
                content = await fetchGoogleSheet(sheetUrl);
            } catch (error) {
                return res.status(400).json({
                    error: `Unable to fetch or parse Google Sheet: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                });
            }
        } else {
            return res
                .status(400)
                .json({ error: "Either a file or sheetUrl is required" });
        }

        // Process the spreadsheet with OpenAI
        const results = await analyzeSpreadsheet({
            query,
            content,
            model: model || "gpt-4o",
            temperature: temperature ? parseFloat(temperature) : 0.7,
            apiKey,
        });

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({
            error: `Internal Server Error: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        });
    }
}
