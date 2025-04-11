#!/bin/bash

# Log colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Vercel build process...${NC}"

# Install any missing types
echo -e "${YELLOW}Installing types...${NC}"
npm install --save-dev @types/papaparse @types/multer

# Build the client
echo -e "${YELLOW}Building client...${NC}"
cd client && npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo -e "${RED}Client build failed with status $BUILD_STATUS${NC}"
  exit $BUILD_STATUS
fi

echo -e "${GREEN}Build completed successfully!${NC}"