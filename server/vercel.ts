import { Express } from 'express';
import { Server } from 'http';
import { log } from './vite';

/**
 * Prepares the Express app for Vercel deployment
 */
export async function setupVercel(app: Express): Promise<Server> {
  log('Setting up for Vercel deployment...', 'vercel');

  // Vercel uses PORT env var automatically in production
  const port = Number(process.env.PORT || '3000');
  
  // Ensure we're binding to 0.0.0.0 for proper deployment
  return new Promise((resolve) => {
    const server = app.listen(port, '0.0.0.0', () => {
      log(`Express server listening on port ${port}`, 'vercel');
      resolve(server);
    });
  });
}