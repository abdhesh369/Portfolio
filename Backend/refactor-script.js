
import fs from 'fs';
import path from 'path';

const routesDir = 'd:/Portfolio/Backend/src/routes';
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  if (!file.endsWith('.ts')) return;
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it has a parseInt(req.params.id, 10) pattern
  if (content.includes('parseInt(req.params.id, 10)')) {
    console.log(`Processing ${file}...`);
    
    // Ensure import exists
    if (!content.includes('parseIntParam')) {
      const importLines = content.split('\n');
      let insertIndex = -1;
      for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].includes('import') && importLines[i].includes('from')) {
          insertIndex = i + 1;
        }
      }
      if (insertIndex !== -1) {
        importLines.splice(insertIndex, 0, 'import { parseIntParam } from "../lib/params.js";');
        content = importLines.join('\n');
      }
    }

    // Flexible regex to match various forms of the ID validation block
    // Matches: 
    // const id = parseInt(req.params.id, 10);
    // if (isNaN(id)) {
    //   res.status(400).json({ [success: false,] message: "Invalid ..." });
    //   return;
    // }
    const regex = /const id = parseInt\(req\.params\.id, 10\);\s*if\s*\(isNaN\(id\)\)\s*\{\s*res\.status\(400\)\.json\(\{\s*(success: false,\s*)?message: "(Invalid .*)"\s*\}\);\s*return;\s*\}/g;
    
    content = content.replace(regex, (match, successPart, label) => {
        return `const id = parseIntParam(res, req.params.id, "${label}");\n            if (id === null) return;`;
    });

    fs.writeFileSync(filePath, content);
  }
});
