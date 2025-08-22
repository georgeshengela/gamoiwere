#!/usr/bin/env node

// Build script for production deployment
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('Building frontend...');
    await execAsync('vite build');
    console.log('Frontend built successfully!');

    console.log('Building backend...');
    // Build production server that has no vite dependencies
    await execAsync('esbuild server/prod-server.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/index.js');
    console.log('Backend built successfully!');

    console.log('Build completed!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();