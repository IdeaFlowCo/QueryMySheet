import { handler } from '../server/index';
import type { Request, Response } from 'express';

/**
 * This is the API entry point for Vercel serverless functions
 * It uses the Express app's handler to process requests
 */
export default async function (req: Request, res: Response) {
  return handler(req, res);
}