#!/bin/bash

# Exit on error
set -e

echo "Running Vercel build script..."

# Build the client and server as configured in package.json
npm run build

# Create a vercel specific output folder
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/api

# Copy static files from client build
cp -r client/dist/* .vercel/output/static/

# Create Vercel config for routing
cat > .vercel/output/config.json << EOF
{
  "version": 3,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# Create the API function
cat > .vercel/output/functions/api.func/index.js << EOF
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

// Import your server code
import { handler } from '../../dist/server/index.js';

export default function (req, res) {
  return handler(req, res);
}
EOF

# Create the API function package.json
cat > .vercel/output/functions/api.func/package.json << EOF
{
  "name": "api-function",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

echo "Vercel build complete!"