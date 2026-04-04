import { defineConfig } from 'vitest/config';

export const baseVitestConfig = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.*', '**/mock/**'],
    },
  },
});

export default baseVitestConfig;
