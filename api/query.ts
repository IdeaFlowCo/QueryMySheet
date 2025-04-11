// import { Request, Response } from "express";
// import multer from "multer";
// import { fetchGoogleSheet, parseUploadedFile } from "../server/sheets";
// import { analyzeSpreadsheet } from "../server/openai";
import type { VercelRequest, VercelResponse } from "@vercel/node"; // Use Vercel types

// Setup multer for file uploads
// const upload = multer({ storage: multer.memoryStorage() });
// const multerAny = upload.any();

// Wrap multer middleware for API route
/*
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
*/

export default async function handler(
    req: VercelRequest, // Use VercelRequest
    res: VercelResponse // Use VercelResponse
) {
    console.log(
        `[api/query] MINIMAL HANDLER REACHED: Method=${req.method}, URL=${req.url}`
    );
    // Set CORS headers - keep for now, simple and unlikely to break
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

    // Handle OPTIONS request - keep for now
    if (req.method === "OPTIONS") {
        console.log("[api/query] Responding to OPTIONS request");
        return res.status(200).end();
    }

    // ONLY log and return success
    console.log("[api/query] Returning minimal success response.");
    return res
        .status(200)
        .json({ message: "Minimal handler reached successfully" });

    /* // Comment out original logic
    // Only handle POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Handle file uploads
        // await runMiddleware(req, res, multerAny);

        // const { query, sheetUrl, apiKey, model, temperature } = req.body;

        // if (!query) {
        //     return res.status(400).json({ error: "Query is required" });
        // }

        // if (!apiKey) {
        //     return res.status(400).json({ error: "API key is required" });
        // }

        let content = "";

        // Process file upload if present
        // if (req.files && req.files.length > 0) {
        //     const file = req.files[0];
        //     try {
        //         content = await parseUploadedFile(file);
        //     } catch (error) {
        //         return res.status(400).json({
        //             error: `Unable to parse uploaded file: ${
        //                 error instanceof Error ? error.message : "Unknown error"
        //             }`,
        //         });
        //     }
        // }
        // Process Google Sheet URL if provided
        // else if (sheetUrl) {
        //     try {
        //         content = await fetchGoogleSheet(sheetUrl);
        //     } catch (error) {
        //         return res.status(400).json({
        //             error: `Unable to fetch or parse Google Sheet: ${
        //                 error instanceof Error ? error.message : "Unknown error"
        //             }`,
        //         });
        //     }
        // } else {
        //     return res
        //         .status(400)
        //         .json({ error: "Either a file or sheetUrl is required" });
        // }

        // Process the spreadsheet with OpenAI
        // const results = await analyzeSpreadsheet({
        //     query,
        //     content,
        //     model: model || "gpt-4o",
        //     temperature: temperature ? parseFloat(temperature) : 0.7,
        //     apiKey,
        // });

        // return res.status(200).json(results);
    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({
            error: `Internal Server Error: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        });
    }
*/
}
