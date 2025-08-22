#!/usr/bin/env node

/**
 * Deployment readiness check for GAMOIWERE.GE
 * Verifies all required environment variables and configurations
 */

import { readFileSync, existsSync } from 'fs';

console.log('🚀 GAMOIWERE.GE Deployment Readiness Check\n');

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_SECRET',
  'BOG_CLIENT_ID',
  'BOG_CLIENT_SECRET',
  'SENDGRID_API_KEY',
  'OPENAI_API_KEY',
  'SMSOFFICE_API_KEY'
];

// Optional but recommended environment variables
const optionalEnvVars = [
  'MAILCHIMP_API_KEY',
  'DEVMONKEYS_API_KEY',
  'SMSOFFICE_SENDER'
];

let allPassed = true;

console.log('✅ Environment Configuration Check:');
console.log('═'.repeat(50));

// Check required variables
console.log('\n🔴 Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 10)}...` : 'MISSING';
  console.log(`${status} ${varName}: ${display}`);
  
  if (!value) {
    allPassed = false;
  }
});

// Check optional variables
console.log('\n🟡 Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️ ';
  const display = value ? `${value.substring(0, 10)}...` : 'NOT SET';
  console.log(`${status} ${varName}: ${display}`);
});

// Check Node.js version
console.log('\n📋 System Information:');
console.log('═'.repeat(50));
console.log(`✅ Node.js Version: ${process.version}`);
console.log(`✅ Platform: ${process.platform} ${process.arch}`);
console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✅ Port: ${process.env.PORT || '5000'}`);

// Check package.json scripts
console.log('\n📦 Build Configuration:');
console.log('═'.repeat(50));

try {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const requiredScripts = ['build', 'start'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script '${script}': ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ Script '${script}': MISSING`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
  allPassed = false;
}

// Check critical files
console.log('\n📁 File Check:');
console.log('═'.repeat(50));

const criticalFiles = [
  'render.yaml',
  'Dockerfile',
  '.env.example',
  'DEPLOYMENT.md',
  'server/index.ts',
  'shared/schema.ts',
  'drizzle.config.ts'
];

criticalFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}: NOT FOUND`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${file}: ERROR CHECKING`);
    allPassed = false;
  }
});

// Final result
console.log('\n🎯 Deployment Readiness Status:');
console.log('═'.repeat(50));

if (allPassed) {
  console.log('🎉 SUCCESS: All checks passed! Ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Push code to GitHub repository');
  console.log('2. Set up PostgreSQL database on Render.com');
  console.log('3. Create web service on Render.com');
  console.log('4. Configure all environment variables');
  console.log('5. Deploy using render.yaml or manual setup');
  process.exit(0);
} else {
  console.log('❌ FAILED: Please fix the issues above before deploying.');
  console.log('\nRefer to DEPLOYMENT.md for detailed instructions.');
  process.exit(1);
}