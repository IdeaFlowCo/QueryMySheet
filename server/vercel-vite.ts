import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// This is a simplified version of the Vite setup for Vercel deployment
// It skips the Vite dev server setup which causes TypeScript errors in production
export async function setupVite(app: Express, server: Server) {
  // In production on Vercel, we don't need the Vite dev server
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
    return;
  }
  
  // For local dev, we'd import the real Vite setup
  // This code won't run in Vercel
  const { setupVite: devSetupVite } = await import('./vite');
  return devSetupVite(app, server);
}

export function serveStatic(app: Express) {
  // For Vercel, the static files are served directly by Vercel
  // This is just a fallback
  const distPath = path.resolve(process.cwd(), "client/dist");

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}