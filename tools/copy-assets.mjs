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

// Videos live on YouTube and the TTS work files are only for re-rendering, so they stay out of the
// deployed site (Vercel storage). Vite copies all of public/ into dist; prune them afterwards.
const EXCLUDED_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm']);
// consonant-simple-video holds only video render frames and motion tests.
const EXCLUDED_DIRS = new Set(['_wav', '_source_wav', 'contact-sheets', 'consonant-simple-video']);

function pruneDir(dir) {
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        fs.rmSync(entryPath, { recursive: true, force: true });
        removed += 1;
      } else {
        removed += pruneDir(entryPath);
      }
    } else if (EXCLUDED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      fs.rmSync(entryPath);
      removed += 1;
    }
  }
  return removed;
}

// Ensure build output exists and copy static folders
try {
  if (fs.existsSync('dist')) {
    console.log('Copying lessons directory to dist/lessons...');
    copyDir('lessons', 'dist/lessons');
    
    console.log('Copying worksheets directory to dist/worksheets...');
    copyDir('worksheets', 'dist/worksheets');
    
    console.log('Successfully copied lessons and worksheets assets to dist!');

    console.log(`Pruned ${pruneDir('dist')} video files and audio work folders from dist.`);
  } else {
    console.error('Error: dist directory does not exist. Run "vite build" first.');
    process.exit(1);
  }
} catch (err) {
  console.error('Error during asset copying:', err);
  process.exit(1);
}
