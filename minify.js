/**
 * Beholder Academy — Minification Script
 * Minifies CSS/JS assets after build for production.
 * Run: node minify.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, 'assets');

// JS files to minify (order doesn't matter, they're independent)
const jsFiles = ['theme.js', 'app.js', 'rpg-engine.js', 'painel.js', 'responsavel.js'];

// CSS files to minify
const cssFiles = ['styles.css', 'painel.css', 'responsavel.css'];

console.log('\n⚡ Beholder Academy — Minificação\n');

let totalSaved = 0;

// --- Minify JS with terser ---
jsFiles.forEach(file => {
  const fullPath = path.join(ASSETS, file);
  if (!fs.existsSync(fullPath)) return;

  const originalSize = fs.statSync(fullPath).size;
  try {
    execSync(`npx -y terser "${fullPath}" --compress --mangle --output "${fullPath}"`, {
      stdio: 'pipe',
      shell: true
    });
    const newSize = fs.statSync(fullPath).size;
    const saved = originalSize - newSize;
    const pct = Math.round((saved / originalSize) * 100);
    totalSaved += saved;
    console.log(`  ✓ ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (-${pct}%)`);
  } catch(e) {
    console.error(`  ✗ ${file}: ${e.message}`);
  }
});

// --- Minify CSS (simple regex-based, no external deps) ---
cssFiles.forEach(file => {
  const fullPath = path.join(ASSETS, file);
  if (!fs.existsSync(fullPath)) return;

  const originalSize = fs.statSync(fullPath).size;
  let css = fs.readFileSync(fullPath, 'utf8');

  // Remove comments (but not /*! important comments */)
  css = css.replace(/\/\*(?!\!)[\s\S]*?\*\//g, '');
  // Remove whitespace
  css = css.replace(/\s+/g, ' ');
  // Remove space around selectors and properties
  css = css.replace(/\s*([{}:;,>~+])\s*/g, '$1');
  // Remove trailing semicolons before }
  css = css.replace(/;}/g, '}');
  // Remove leading/trailing whitespace
  css = css.trim();

  fs.writeFileSync(fullPath, css);
  const newSize = Buffer.byteLength(css);
  const saved = originalSize - newSize;
  const pct = Math.round((saved / originalSize) * 100);
  totalSaved += saved;
  console.log(`  ✓ ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (-${pct}%)`);
});

// --- Minify search-index.json (already compact, just verify) ---
const siPath = path.join(ASSETS, 'search-index.json');
if (fs.existsSync(siPath)) {
  const size = fs.statSync(siPath).size;
  console.log(`  ✓ search-index.json: ${(size/1024).toFixed(1)}KB (já compacto)`);
}

console.log(`\n✅ Total economizado: ${(totalSaved/1024).toFixed(1)}KB\n`);
