import { Express, Request, Response } from 'express';
import { log } from './vite';

/**
 * Adapts the Express app to work in a serverless environment
 * This function creates a handler that can be used by Vercel
 */
export function createServerlessHandler(app: Express) {
  log('Creating serverless handler for Express app', 'adapter');

  return async (req: Request, res: Response) => {
    // Log the incoming request in serverless mode
    log(`Serverless ${req.method} ${req.path}`, 'adapter');
    
    // Pass the request to the Express app
    return new Promise<void>((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          log(`Error in serverless handler: ${err}`, 'adapter');
          reject(err);
          return;
        }
        
        // If Express didn't handle the request (no response sent)
        if (!res.headersSent) {
          res.status(404).send('Not found');
        }
        
        resolve();
      });
    });
  };
}