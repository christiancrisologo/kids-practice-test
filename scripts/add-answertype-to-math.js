const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../public/configs/math.json');
const backupPath = filePath + '.bak';

function main() {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    process.exit(1);
  }

  // Backup original file
  fs.writeFileSync(backupPath, raw, 'utf8');
  console.log('Backup written to', backupPath);

  let changed = 0;

  const updated = data.map(item => {
    // Only operate on objects
    if (item && typeof item === 'object') {
      const hasTemplate = typeof item.formula === 'string' && item.formula.includes('{{');
      const newType = hasTemplate ? ['mcq', 'text'] : ['text'];

      // If answertype exists and equals desired, skip
      const existing = item.answertype;
      const same = Array.isArray(existing) && existing.length === newType.length && existing.every((v, i) => v === newType[i]);
      if (!same) {
        item.answertype = newType;
        changed++;
      }
    }
    return item;
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
  console.log('Updated', changed, 'entries in', filePath);
}

main();
