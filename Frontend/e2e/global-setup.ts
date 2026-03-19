import { FullConfig } from '@playwright/test';


async function globalSetup(_config: FullConfig) {
  // Use 127.0.0.1:5005 as configured in playwright.config.ts
  const backendUrl = process.env.VITE_API_URL || 'http://127.0.0.1:5005';
  const pingUrl = `${backendUrl}/ping`;
  const resetUrl = `${backendUrl}/api/v1/test/reset`;
  
  const maxAttempts = 135; // 135 attempts, 2s apart = 270s (4.5 minutes)
  let attempts = 0;
  let success = false;

  console.warn(`\n[E2E Setup] Waiting for backend at ${backendUrl}...`);
  
  while (attempts < maxAttempts && !success) {
    try {
      // 1. Check if server is listening and responding to /ping
      const pingRes = await fetch(pingUrl);
      if (!pingRes.ok) {
        throw new Error(`Ping failed with status ${pingRes.status}`);
      }

      // 2. Server is up, now try to reset environment
      console.warn('\n[E2E Setup] Backend reachable. Resetting environment...');
      const resetRes = await fetch(resetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
      });
      
      if (resetRes.ok) {
        console.warn('[E2E Setup] \u2705 Backend environment reset successfully.');
        success = true;
      } else {
        const errorText = await resetRes.text();
        throw new Error(`Reset failed (${resetRes.status}): ${errorText}`);
      }
    } catch (error: unknown) {
      attempts++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (attempts < maxAttempts) {
        if (attempts % 5 === 0) process.stdout.write(`${attempts}`);
        else process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error(`\n[E2E Setup] \u274C Error: Backend server not ready at ${backendUrl} after ${maxAttempts * 2}s`);
        console.error(`Reason: ${errorMessage}`);
        throw new Error(
          `[E2E Setup] Backend server not ready at ${backendUrl} after ${maxAttempts * 2}s. Reason: ${errorMessage}`,
          { cause: error }
        );
      }
    }
  }
}


export default globalSetup;
