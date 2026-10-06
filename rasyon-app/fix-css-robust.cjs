const fs = require('fs');
const file = 'src/ui/styles.css';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.dash-stats-row {')) {
    // Look ahead to see if it's the right block
    if (lines[i+1].includes('display: grid;') && lines[i+2].includes('grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));')) {
      newLines.push('.dash-stats-row {');
      newLines.push('  display: grid;');
      newLines.push('  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));');
      newLines.push('  gap: 0.5rem;');
      newLines.push('}');
      newLines.push('');
      newLines.push('@media (max-width: 480px) {');
      newLines.push('  .dash-stats-row {');
      newLines.push('    grid-template-columns: repeat(2, 1fr);');
      newLines.push('  }');
      newLines.push('}');
      // Skip the old broken lines
      while (i < lines.length && !lines[i].includes('.dash-stat {')) {
        i++;
      }
      i--; // step back so .dash-stat { gets processed
      continue;
    }
  }
  newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log('Fixed CSS syntax robustly');
