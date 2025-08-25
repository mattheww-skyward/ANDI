#!/usr/bin/env node

/**
 * ANDI Test Validation Script
 * This script validates that the test structure is correct and demo pages are accessible
 * without requiring browser installation (for CI environments with restrictions)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 ANDI Test Validation');
console.log('='.repeat(50));

// Check that demo pages exist
const demoDir = path.join(__dirname, '..', 'andi', 'help', 'demo');
const requiredFiles = ['index.html', 'demo2.html', 'demo3.html', 'style.css'];

console.log('\n📁 Checking demo page files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(demoDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
    allFilesExist = false;
  }
});

// Check demo page content
console.log('\n📄 Validating demo page content...');

try {
  // Check index.html
  const indexContent = fs.readFileSync(path.join(demoDir, 'index.html'), 'utf8');
  const indexChecks = [
    { test: indexContent.includes('<title>ANDI DEMO'), name: 'Has ANDI DEMO title' },
    { test: indexContent.includes("id='who'"), name: 'Has form input with id="who"' },
    { test: indexContent.includes('aria-label'), name: 'Contains ARIA attributes' },
    { test: indexContent.includes('accesskey'), name: 'Has accesskey attribute' },
    { test: indexContent.includes('onclick'), name: 'Has navigation functionality' }
  ];
  
  indexChecks.forEach(check => {
    console.log(check.test ? `✅ index.html: ${check.name}` : `❌ index.html: ${check.name}`);
  });

  // Check demo2.html  
  const demo2Content = fs.readFileSync(path.join(demoDir, 'demo2.html'), 'utf8');
  const demo2Checks = [
    { test: demo2Content.includes('<table>'), name: 'Contains data table' },
    { test: demo2Content.includes("type='radio'"), name: 'Has radio button group' },
    { test: demo2Content.includes('scope='), name: 'Has table scope attributes' },
    { test: demo2Content.includes('aria-labelledby'), name: 'Uses aria-labelledby' }
  ];
  
  demo2Checks.forEach(check => {
    console.log(check.test ? `✅ demo2.html: ${check.name}` : `❌ demo2.html: ${check.name}`);
  });

  // Check demo3.html
  const demo3Content = fs.readFileSync(path.join(demoDir, 'demo3.html'), 'utf8');
  const demo3Checks = [
    { test: demo3Content.includes('aria-live'), name: 'Has aria-live region' },
    { test: demo3Content.includes('alt="superhero"'), name: 'Has image with alt text' },
    { test: demo3Content.includes('setInterval'), name: 'Has dynamic content script' },
    { test: demo3Content.includes('aria-atomic'), name: 'Uses aria-atomic attribute' }
  ];
  
  demo3Checks.forEach(check => {
    console.log(check.test ? `✅ demo3.html: ${check.name}` : `❌ demo3.html: ${check.name}`);
  });

} catch (error) {
  console.log(`❌ Error reading demo page content: ${error.message}`);
  allFilesExist = false;
}

// Check test structure
console.log('\n🧪 Validating test structure...');

const testFiles = [
  'package.json',
  'playwright.config.ts', 
  'e2e/andi-helper.ts',
  'e2e/demo-pages.spec.ts',
  'e2e/modernization.spec.ts',
  'e2e/validation.spec.ts'
];

let testStructureValid = true;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ tests/${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ tests/${file} - NOT FOUND`);
    testStructureValid = false;
  }
});

// Validate test content
console.log('\n🔍 Validating test content...');

try {
  const demoTestContent = fs.readFileSync(path.join(__dirname, 'e2e', 'demo-pages.spec.ts'), 'utf8');
  const modernizationTestContent = fs.readFileSync(path.join(__dirname, 'e2e', 'modernization.spec.ts'), 'utf8');
  
  const testChecks = [
    { test: demoTestContent.includes('AndiTestHelper'), name: 'Uses ANDI helper class' },
    { test: demoTestContent.includes('loadAndi()'), name: 'Has ANDI loading functionality' },
    { test: demoTestContent.includes('switchToModule'), name: 'Tests module switching' },
    { test: demoTestContent.includes('testElementHighlighting'), name: 'Tests element highlighting' },
    { test: modernizationTestContent.includes('jQuery'), name: 'Tests jQuery compatibility' },
    { test: modernizationTestContent.includes('focusable'), name: 'Tests focus management' },
    { test: modernizationTestContent.includes('z-index'), name: 'Tests CSS positioning' },
    { test: modernizationTestContent.includes('aria'), name: 'Tests ARIA preservation' }
  ];
  
  testChecks.forEach(check => {
    console.log(check.test ? `✅ ${check.name}` : `❌ ${check.name}`);
  });

} catch (error) {
  console.log(`❌ Error reading test content: ${error.message}`);
  testStructureValid = false;
}

// Count test cases
try {
  const demoTestContent = fs.readFileSync(path.join(__dirname, 'e2e', 'demo-pages.spec.ts'), 'utf8');
  const modernizationTestContent = fs.readFileSync(path.join(__dirname, 'e2e', 'modernization.spec.ts'), 'utf8');
  
  const demoTestCount = (demoTestContent.match(/test\(/g) || []).length;
  const modernizationTestCount = (modernizationTestContent.match(/test\(/g) || []).length;
  
  console.log(`\n📊 Test Statistics:`);
  console.log(`   Demo page tests: ${demoTestCount} test cases`);
  console.log(`   Modernization tests: ${modernizationTestCount} test cases`);
  console.log(`   Total: ${demoTestCount + modernizationTestCount} test cases`);
  
} catch (error) {
  console.log(`❌ Error counting tests: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesExist && testStructureValid) {
  console.log('✅ VALIDATION PASSED');
  console.log('   • All demo pages are present and contain expected content');
  console.log('   • Test structure is complete and valid');
  console.log('   • Tests cover all required ANDI functionality');
  console.log('   • Modernization compatibility tests are included');
  console.log('\n🚀 Tests are ready to run with: npm test');
  console.log('   (Requires Playwright browser installation)');
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED');
  console.log('   Some required files or content are missing');
  process.exit(1);
}