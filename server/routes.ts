import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { analyzeSpreadsheet } from "./openai";
import { fetchGoogleSheet, parseUploadedFile } from "./sheets";
import { openAiResponseSchema } from "@shared/schema";
import { ZodError } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for processing queries
  app.post('/api/query', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const { query, sheetUrl, model, temperature } = req.body;
      // Use the environment variable for API key
      const apiKey = process.env.OPENAI_API_KEY;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      if (!apiKey) {
        return res.status(500).json({ message: "Server configuration error: Missing API key" });
      }

      let spreadsheetContent: string;

      // Get data from either the uploaded file or Google Sheet URL
      if (req.file) {
        // Handle file upload
        spreadsheetContent = await parseUploadedFile(req.file);
      } else if (sheetUrl) {
        // Handle Google Sheet URL
        spreadsheetContent = await fetchGoogleSheet(sheetUrl);
      } else {
        return res.status(400).json({ message: "Either a file or Google Sheet URL is required" });
      }

      // Analyze spreadsheet with OpenAI
      const analysisResult = await analyzeSpreadsheet({
        query,
        content: spreadsheetContent,
        model: model || "gpt-4o-mini", // Default to gpt-4o-mini as requested
        temperature: parseFloat(temperature || "0.3"),
        apiKey
      });

      // Validate the response using zod schema
      const validatedResult = openAiResponseSchema.parse(analysisResult);

      // Send results back to client
      return res.status(200).json(validatedResult);
    } catch (error) {
      console.error("Error processing query:", error);

      if (error instanceof ZodError) {
        return res.status(422).json({ 
          message: "Invalid response format from OpenAI", 
          details: error.errors 
        });
      }

      return res.status(500).json({ 
        message: error.message || "An error occurred while processing your request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
