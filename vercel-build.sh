#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Vercel build process...${NC}"

# Build the client
echo -e "${YELLOW}Building client application...${NC}"
cd client && npm run build

echo -e "${GREEN}Build completed successfully!${NC}"
