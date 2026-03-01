import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    // Global test configuration
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],

    // Test file patterns
    include: [
      'packages/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'tests/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'coverage',
      '**/*.d.ts',
      'packages/**/node_modules/**',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      include: [
        'packages/**/*.ts',
        'packages/**/*.tsx',
        'packages/**/*.js',
        'packages/**/*.jsx',
      ],
      exclude: [
        'packages/**/*.d.ts',
        'packages/**/*.test.{ts,tsx,js,jsx}',
        'packages/**/*.spec.{ts,tsx,js,jsx}',
        'packages/**/dist/**',
        'packages/**/node_modules/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Setup files
    setupFiles: ['./test-setup.ts'],

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Watch mode
    watch: false,

    // Isolate tests
    isolate: true,

    // Reporter configuration
    reporters: ['default', 'junit'],

    // Output file for JUnit reporter
    outputFile: {
      junit: 'test-results/junit.xml',
    },
  },

  // Resolve configuration for monorepo
  resolve: {
    alias: {
      // Package aliases for easier imports
      '@frontal-cloud/ai': resolve(__dirname, 'packages/ai/src'),
      '@frontal-cloud/compute': resolve(__dirname, 'packages/compute/src'),
      '@frontal-cloud/flags': resolve(__dirname, 'packages/flags/src'),
      '@frontal-cloud/functions': resolve(__dirname, 'packages/functions/src'),
      '@frontal-cloud/logging': resolve(__dirname, 'packages/logging/src'),
      '@frontal-cloud/notifications': resolve(__dirname, 'packages/notifications/src'),
      '@frontal-cloud/storage': resolve(__dirname, 'packages/storage/src'),
    },
  },

  // Define constants for tests
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
