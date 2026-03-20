import { readFileSync, writeFileSync } from 'fs';
const j = JSON.parse(readFileSync(process.env.TEMP + '/e2e-results2.json', 'utf8'));
const fails = [];

function walk(suites) {
  for (const s of suites) {
    for (const spec of (s.specs || [])) {
      for (const t of spec.tests) {
        for (const r of t.results) {
          if (r.status === 'failed' || r.status === 'timedOut') {
            fails.push({
              title: spec.title,
              file: spec.file,
              err: (r.error?.message || '').split('\n').slice(0, 5).join(' | ')
            });
          }
        }
      }
    }
    if (s.suites) walk(s.suites);
  }
}

walk(j.suites || []);
const lines = [`Total failures: ${fails.length}`, ''];
fails.forEach((f, i) => {
  lines.push(`[${i + 1}] ${f.file} :: ${f.title}`);
  lines.push(`    ${f.err}`);
  lines.push('');
});
writeFileSync('d:/Portfolio/Frontend/failures2.txt', lines.join('\n'));
console.log(`Wrote ${fails.length} failures to d:/Portfolio/Frontend/failures2.txt`);
