import { defineConfig, devices } from '@playwright/test';

/** iPhone 14 in a home-screen web app: 390 x 844 points, no browser chrome. */
const IPHONE_14 = { width: 390, height: 844 };

/** Same viewport in Chromium, which can also fake a camera for the live value view. */
const CHROMIUM = {
  ...devices['Pixel 7'],
  viewport: IPHONE_14,
  permissions: ['camera', 'clipboard-read', 'clipboard-write'],
  // The fake camera defaults to 20 fps; a phone camera gives 30.
  launchOptions: { args: ['--use-fake-device-for-media-stream=fps=30', '--use-fake-ui-for-media-stream'] },
};

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    serviceWorkers: 'allow',
  },
  projects: [
    {
      // The target device: Safari's engine at the iPhone 14 viewport.
      name: 'webkit',
      testIgnore: 'framerate.spec.ts',
      use: { ...devices['iPhone 14'], viewport: IPHONE_14 },
    },
    {
      name: 'chromium',
      testIgnore: 'framerate.spec.ts',
      use: CHROMIUM,
    },
    {
      // Timing-sensitive, so it waits until the other projects are done with the CPU.
      name: 'framerate',
      testMatch: 'framerate.spec.ts',
      dependencies: ['webkit', 'chromium'],
      use: CHROMIUM,
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
