const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', async msg => {
        if (msg.type() === 'error') {
            console.log(`BROWSER ERROR: ${msg.text()}`);
        }
    });

    try {
        console.log("Navigating to http://localhost:5173/admin...");
        await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        const errorElement = await page.$('.text-red-300');
        if (errorElement) {
            const text = await errorElement.innerText();
            console.log("=============== REACT ERROR BOUNDARY CAUGHT THIS ===============");
            console.log(text);
            console.log("================================================================");
        } else {
            console.log("No error element found with class .text-red-300");
            // check if we have the critical error text
            const criticalText = await page.getByText(/Critical System Error/i).isVisible();
            if (criticalText) {
                console.log("Critical System Error title found, but no dev trace displayed.");
            }
        }
    } catch (e) {
        console.log("Test error: ", e.message);
    } finally {
        await browser.close();
    }
})();
