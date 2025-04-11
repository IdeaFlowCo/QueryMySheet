import type { Request, Response } from 'express';

export default function handler(
  req: Request,
  res: Response
) {
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

  // API endpoint info
  res.status(200).json({
    message: 'API is running',
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Check API health'
      },
      {
        path: '/api/query',
        method: 'POST',
        description: 'Query spreadsheet data with natural language'
      }
    ],
    timestamp: new Date().toISOString()
  });
}