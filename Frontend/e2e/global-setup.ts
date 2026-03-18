import { FullConfig } from '@playwright/test';


async function globalSetup(config: FullConfig) {
  // We assume the backend is running on http://localhost:5000 
  const backendUrl = 'http://localhost:5000';

  console.log('\n[E2E Setup] Resetting backend environment...');
  
  try {
    const response = await fetch(`${backendUrl}/api/v1/test/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
      console.log('[E2E Setup] \u2705 Backend environment reset successfully.');
    } else {
      console.warn(`[E2E Setup] \u26A0\uFE0F Backend reset returned status ${response.status}`);
    }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.error('[E2E Setup] \u274C Error: Backend server not reachable at http://localhost:5000');
      if (process.env.CI) process.exit(1);
    } else {
      console.error('[E2E Setup] \u274C Error resetting backend:', error.message);
    }
  }
}


export default globalSetup;
