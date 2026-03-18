$env:TEST_ADMIN_PASSWORD = 'mock-password'
npx playwright test e2e/admin-flow.spec.ts e2e/critical-paths.spec.ts --project=chromium --reporter=list | Out-File -FilePath test_run_results_utf8.txt -Encoding utf8
