/**
 * Global test setup for Frontal Cloud SDK
 * This file is automatically loaded by vitest before running tests
 */

import { vi, expect } from 'vitest';

console.log('🚀 Test setup file loaded!');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: vi.fn(),
  // Uncomment to suppress console.warn in tests
  // warn: vi.fn(),
  // Uncomment to suppress console.error in tests
  // error: vi.fn(),
};

// Set up global test environment variables
process.env.NODE_ENV = 'test';
process.env.CI = 'true';

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Mock WebSocket if not available
if (!global.WebSocket) {
  global.WebSocket = vi.fn();
}

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

console.log('✅ Custom matchers registered!');

// Type declaration for custom matchers
declare global {
  namespace Vi {
    interface Assertion {
      toBeWithinRange(floor: number, ceiling: number): Assertion;
    }
  }
}
