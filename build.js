#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const BUILD_DIR = path.resolve(__dirname, 'dist');
const CLIENT_BUILD_DIR = path.resolve(__dirname, 'client', 'dist');

// Utility function for executing shell commands
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    throw error;
  }
}

// Create build directory if it doesn't exist
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Build steps
console.log('\n--- Building for production ---\n');

// 1. Build frontend
console.log('\n--- Building Frontend ---');
runCommand('cd client && npm run build');

// 2. Copy necessary files for deployment
console.log('\n--- Copying deployment files ---');
fs.cpSync(CLIENT_BUILD_DIR, BUILD_DIR, { recursive: true });

// Create the server directory in the build folder
const serverBuildDir = path.join(BUILD_DIR, 'server');
if (!fs.existsSync(serverBuildDir)) {
  fs.mkdirSync(serverBuildDir, { recursive: true });
}

// Copy server files 
console.log('\n--- Processing server files ---');
runCommand('tsc -p tsconfig.json --outDir dist/server server/*.ts');

// Copy package.json for deployment
console.log('\n--- Copying package.json ---');
const packageJson = require('./package.json');

// Simplify package.json for production
const prodPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: 'server/index.js',
  scripts: {
    start: 'node server/index.js'
  },
  dependencies: packageJson.dependencies,
  engines: {
    node: '>=18.x'
  }
};

fs.writeFileSync(
  path.join(BUILD_DIR, 'package.json'),
  JSON.stringify(prodPackageJson, null, 2)
);

// Copy vercel.json to the root of the build folder
console.log('\n--- Copying Vercel configuration ---');
fs.copyFileSync(
  path.join(__dirname, 'vercel.json'),
  path.join(BUILD_DIR, 'vercel.json')
);

console.log('\n--- Build complete! ---');
console.log(`\nProduction files are in: ${BUILD_DIR}`);
console.log('Run the following to test the production build:');
console.log(`cd ${BUILD_DIR} && npm install --production && npm start`);
console.log('\nOr deploy to Vercel with:');
console.log(`cd ${BUILD_DIR} && vercel deploy`);