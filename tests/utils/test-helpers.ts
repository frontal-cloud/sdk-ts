/**
 * Test helper utilities for Frontal Cloud SDK tests
 * Common utilities and mock factories for testing
 */

import { vi } from 'vitest';

/**
 * Mock factory for creating mock API responses
 */
export const createMockApiResponse = <T = any>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  headers: new Headers({
    'content-type': 'application/json',
  }),
});

/**
 * Mock factory for creating mock error responses
 */
export const createMockErrorResponse = (message: string, status = 400) => ({
  ok: false,
  status,
  statusText: 'Error',
  json: () => Promise.resolve({ error: message }),
  text: () => Promise.resolve(JSON.stringify({ error: message })),
  headers: new Headers({
    'content-type': 'application/json',
  }),
});

/**
 * Mock factory for creating mock file objects
 */
export const createMockFile = (name: string, content: string, type = 'text/plain'): File => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};

/**
 * Mock factory for creating mock configuration objects
 */
export const createMockConfig = (overrides: Record<string, any> = {}) => ({
  apiKey: 'test-api-key',
  baseUrl: 'https://api.test.com',
  timeout: 5000,
  retries: 3,
  ...overrides,
});

/**
 * Wait for a specified amount of time (for testing async operations)
 */
export const waitFor = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a mock event emitter for testing
 */
export const createMockEventEmitter = () => {
  const listeners: Record<string, Array<(...args: any[]) => void>> = {};
  
  return {
    on: (event: string, listener: (...args: any[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(listener);
    },
    off: (event: string, listener: (...args: any[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(l => l !== listener);
      }
    },
    emit: (event: string, ...args: any[]) => {
      if (listeners[event]) {
        listeners[event].forEach(listener => listener(...args));
      }
    },
    listenerCount: (event: string) => listeners[event]?.length || 0,
  };
};

/**
 * Mock fetch implementation
 */
export const createMockFetch = () => {
  const mockResponses = new Map<string, any>();
  
  const mockFetch = vi.fn(async (url: string, options?: RequestInit) => {
    const key = `${url}${JSON.stringify(options || {})}`;
    
    if (mockResponses.has(key)) {
      return mockResponses.get(key);
    }
    
    // Default response
    return createMockApiResponse({ message: 'Not found' }, 404);
  });
  
  mockFetch.mockResponse = (url: string, response: any, options?: RequestInit) => {
    const key = `${url}${JSON.stringify(options || {})}`;
    mockResponses.set(key, response);
  };
  
  mockFetch.clearMocks = () => {
    mockResponses.clear();
    mockFetch.mockClear();
  };
  
  return mockFetch;
};

/**
 * Create a mock logger for testing
 */
export const createMockLogger = () => {
  const logs: Array<{ level: string; message: string; timestamp: Date }> = [];
  
  return {
    info: (message: string) => {
      logs.push({ level: 'info', message, timestamp: new Date() });
    },
    warn: (message: string) => {
      logs.push({ level: 'warn', message, timestamp: new Date() });
    },
    error: (message: string) => {
      logs.push({ level: 'error', message, timestamp: new Date() });
    },
    debug: (message: string) => {
      logs.push({ level: 'debug', message, timestamp: new Date() });
    },
    getLogs: () => logs,
    clearLogs: () => {
      logs.length = 0;
    },
    hasLog: (level: string, message: string) => 
      logs.some(log => log.level === level && log.message.includes(message)),
  };
};

/**
 * Test data generator
 */
export const generateTestData = {
  string: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  number: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  boolean: () => Math.random() < 0.5,
  array: <T>(generator: () => T, length = 5): T[] => 
    Array.from({ length }, generator),
  object: <T>(generator: () => T, keys: string[]): Record<string, T> => 
    keys.reduce((acc, key) => ({ ...acc, [key]: generator() }), {}),
};

/**
 * Performance test helper
 */
export const measurePerformance = async <T>(
  operation: () => T | Promise<T>,
  iterations = 1
): Promise<{ result: T; duration: number; averageDuration: number }> => {
  const results: Array<{ result: T; duration: number }> = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    results.push({ result, duration: end - start });
  }
  
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const averageDuration = totalDuration / iterations;
  
  return {
    result: results[0].result, // Return the first result
    duration: totalDuration,
    averageDuration,
  };
};

/**
 * Environment helper for tests
 */
export const withEnvironment = <T>(
  env: Record<string, string>,
  callback: () => T
): T => {
  const originalEnv = { ...process.env };
  
  // Set test environment
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  try {
    return callback();
  } finally {
    // Restore original environment
    process.env = originalEnv;
  }
};

/**
 * Retry helper for flaky tests
 */
export const retry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        await waitFor(delay * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
};
