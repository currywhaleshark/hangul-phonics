import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
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

// Ensure build output exists and copy static folders
try {
  if (fs.existsSync('dist')) {
    console.log('Copying lessons directory to dist/lessons...');
    copyDir('lessons', 'dist/lessons');
    
    console.log('Copying worksheets directory to dist/worksheets...');
    copyDir('worksheets', 'dist/worksheets');
    
    console.log('Successfully copied lessons and worksheets assets to dist!');
  } else {
    console.error('Error: dist directory does not exist. Run "vite build" first.');
    process.exit(1);
  }
} catch (err) {
  console.error('Error during asset copying:', err);
  process.exit(1);
}
