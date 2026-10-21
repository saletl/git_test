import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the production build (`vite preview`). These are simulated phone and tablet
 * viewports in desktop Chromium, not real devices.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'phone-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: 'phone-320', use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, testMatch: /layout|flows/ },
    { name: 'phone-375', use: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, testMatch: /layout/ },
    { name: 'phone-430', use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, testMatch: /layout/ },
    { name: 'tablet', use: { viewport: { width: 820, height: 1180 }, hasTouch: true }, testMatch: /layout/ },
  ],
});
