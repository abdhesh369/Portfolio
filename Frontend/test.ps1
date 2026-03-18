$env:VITE_DISABLE_PWA = 'true'
$env:TEST_ADMIN_PASSWORD = 'mock-password'
npm run build
npx playwright test --project=chromium
