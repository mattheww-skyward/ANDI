const fs = require('fs');
const path = require('path');

const browser = process.argv[2];
if (!['chrome', 'firefox', 'edge'].includes(browser)) {
  console.error('Usage: node build.js <chrome|firefox|edge>');
  process.exit(1);
}

// Read the base manifest
const baseManifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

// Browser-specific modifications
const browserConfigs = {
  chrome: {
    // Chrome uses service_worker
    background: {
      service_worker: "background.js"
    }
  },
  firefox: {
    // Firefox uses scripts array and doesn't support service_worker
    background: {
      scripts: ["background.js"]
    },
    // Firefox requires explicit browser_specific_settings
    browser_specific_settings: {
      gecko: {
        id: "andi@mattheww-skyward.com",
        strict_min_version: "109.0"
      }
    }
  },
  edge: {
    // Edge uses service_worker like Chrome
    background: {
      service_worker: "background.js"
    }
  }
};

// Create browser-specific manifest
const manifest = { ...baseManifest, ...browserConfigs[browser] };

// Create dist directory for this browser
const distDir = `dist/${browser}`;
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy all files except manifest.json to dist directory
const filesToCopy = [
  'background.js',
  'content-script.js', 
  'jquery-3.7.1.min.js',
  'readme.md'
];

const dirsToCopy = [
  'andi',
  'icons'
];

// Copy files
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(distDir, file));
  }
});

// Copy directories recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

dirsToCopy.forEach(dir => {
  if (fs.existsSync(dir)) {
    copyDir(dir, path.join(distDir, dir));
  }
});

// Write the browser-specific manifest
fs.writeFileSync(
  path.join(distDir, 'manifest.json'), 
  JSON.stringify(manifest, null, 2)
);

console.log(`Built ${browser} extension in ${distDir}/`);