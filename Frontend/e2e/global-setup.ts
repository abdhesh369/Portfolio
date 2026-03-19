import { FullConfig } from '@playwright/test';


async function globalSetup(config: FullConfig) {
  // Use 127.0.0.1 for maximum stability on Windows
  const backendUrl = 'http://127.0.0.1:5005';
  const maxAttempts = 60; // 60 attempts, 2s apart = 120s
  let attempts = 0;
  let success = false;

  console.log('\n[E2E Setup] Waiting for backend and resetting environment...');
  
  while (attempts < maxAttempts && !success) {
    try {
      const response = await fetch(`${backendUrl}/api/v1/test/reset`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      
      if (response.ok) {
        console.log('[E2E Setup] \u2705 Backend environment reset successfully.');
        success = true;
      } else if (response.status === 404) {
        // Routes might not be registered yet if DB check is still running
        throw new Error('Backend responding but routes not ready (404)');
      } else {
        console.warn(`[E2E Setup] \u26A0\uFE0F Backend reset returned status ${response.status}`);
        // Consider non-404 non-ok as "ready enough" or log and retry
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      attempts++;
      if (attempts < maxAttempts) {
        process.stdout.write('.'); // Progress indicator
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error(`\n[E2E Setup] \u274C Error: Backend server not reachable at ${backendUrl} after 60s`);
        console.error(`Reason: ${error.message}`);
        if (process.env.CI) process.exit(1);
      }
    }
  }
}


export default globalSetup;
