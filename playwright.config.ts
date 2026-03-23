import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4010',
    trace: 'on-first-retry',
    headless: true,
    channel: 'chrome',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'pnpm build && HOST=127.0.0.1 PORT=4010 node .output/server/index.mjs',
    url: 'http://127.0.0.1:4010',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
