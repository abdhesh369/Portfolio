const sanitizeCssRegex = (css) => {
    if (!css) return null;
    return css
        .replace(/url\b\s*\(/gi, '/* url-stripped */')
        .replace(/@import\b/gi, '/* import-stripped */')
        .replace(/expression\b\s*\(/gi, '/* expression-stripped */')
        .replace(/javascript\s*:/gi, '/* js-stripped */')
        .replace(/vbscript\s*:/gi, '/* vbs-stripped */')
        .replace(/-moz-binding\b/gi, '/* binding-stripped */')
        .replace(/@font-face\b/gi, '/* font-face-stripped */')
        .replace(/@charset\b/gi, '/* charset-stripped */')
        .replace(/@namespace\b/gi, '/* namespace-stripped */');
};

const testCases = [
    { name: "Basic URL", input: 'body { background: url("image.png") }', expected: 'body { background: /* url-stripped */"image.png") }' },
    { name: "URL with spaces", input: 'body { background: url  ( "image.png" ) }', expected: 'body { background: /* url-stripped */ "image.png" ) }' },
    { name: "Case insensitive URL", input: 'body { background: UrL("image.png") }', expected: 'body { background: /* url-stripped */"image.png") }' },
    { name: "Import", input: '@import "evil.css";', expected: '/* import-stripped */ "evil.css";' },
    { name: "Case insensitive Import", input: '@IMPORT "evil.css";', expected: '/* import-stripped */ "evil.css";' },
    { name: "Expression", input: '* { behavior: expression(alert(1)); }', expected: '* { behavior: /* expression-stripped */alert(1)); }' },
    { name: "Javascript protocol", input: 'div { background: "javascript:alert(1)" }', expected: 'div { background: "/* js-stripped */alert(1)" }' },
    { name: "Vbscript protocol", input: 'div { background: "vbscript:alert(1)" }', expected: 'div { background: "/* vbs-stripped */alert(1)" }' },
    { name: "-moz-binding", input: 'div { -moz-binding: url(xss.xml#xss); }', expected: 'div { /* binding-stripped */: /* url-stripped */xss.xml#xss); }' },
    { name: "Font-face", input: '@font-face { font-family: "MyFont"; }', expected: '/* font-face-stripped */ { font-family: "MyFont"; }' },
    { name: "Charset", input: '@charset "UTF-8";', expected: '/* charset-stripped */ "UTF-8";' },
    { name: "Namespace", input: '@namespace url(http://www.w3.org/1999/xhtml);', expected: '/* namespace-stripped */ /* url-stripped */http://www.w3.org/1999/xhtml);' },
    { name: "Safe URL-like string", input: '.curly-brackets { content: "url-like text"; }', expected: '.curly-brackets { content: "url-like text"; }' },
    { name: "Safe import-like string", input: '.important { color: red !important; }', expected: '.important { color: red !important; }' },
];

let failed = 0;
testCases.forEach(tc => {
    const result = sanitizeCssRegex(tc.input);
    const passed = result === tc.expected;
    if (!passed) {
        console.log(`[FAIL] ${tc.name}`);
        console.log(`  Input:    ${tc.input}`);
        console.log(`  Expected: ${tc.expected}`);
        console.log(`  Actual:   ${result}`);
        failed++;
    } else {
        console.log(`[PASS] ${tc.name}`);
    }
});

if (failed > 0) {
    console.log(`\nTests failed: ${failed}`);
    process.exit(1);
} else {
    console.log("\nAll tests passed!");
    process.exit(0);
}
