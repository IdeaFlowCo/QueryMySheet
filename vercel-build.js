#!/usr/bin/env node

// This is a custom build script for Vercel deployment

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command) {
  log(`Running: ${command}`, colors.blue);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error executing: ${command}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

log('Starting Vercel build process...', colors.green);

// Build the client
log('Building client...', colors.yellow);
if (!runCommand('cd client && npm run build')) {
  process.exit(1);
}

// Create API directory if it doesn't exist
const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
  log('Creating API directory...', colors.yellow);
  fs.mkdirSync(apiDir, { recursive: true });
}

// Copy server/index.ts to api/index.ts if not already there
const serverIndexPath = path.join(__dirname, 'server', 'index.ts');
const apiIndexPath = path.join(apiDir, 'index.ts');

if (!fs.existsSync(apiIndexPath)) {
  log('Creating API endpoint...', colors.yellow);
  
  const apiIndexContent = `import { Express, Request, Response } from 'express';
import express from 'express';
import '../server/routes';

// Simple express app for Vercel Functions
const app = express();
app.use(express.json());

// Register routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import your routes
import { registerRoutes } from '../server/routes';

// This function will be called by Vercel
export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Create a new Express app for this request
  const expressApp = express();
  expressApp.use(express.json());
  
  // Register all routes
  await registerRoutes(expressApp);
  
  // Handle the request
  return new Promise((resolve, reject) => {
    expressApp(req, res, (err) => {
      if (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        resolve();
        return;
      }
      
      if (!res.headersSent) {
        res.status(404).json({ error: 'Not Found' });
      }
      resolve();
    });
  });
}`;

  fs.writeFileSync(apiIndexPath, apiIndexContent, 'utf8');
}

log('Vercel build completed successfully!', colors.green);