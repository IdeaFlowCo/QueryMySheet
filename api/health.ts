import type { Request, Response } from 'express';

export default function handler(
  req: Request,
  res: Response
) {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL === '1'
  });
}