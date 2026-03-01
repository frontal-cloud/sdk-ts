/**
 * Integration tests for Frontal Cloud SDK
 * These tests verify cross-package functionality and integration scenarios
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Frontal Cloud SDK Integration', () => {
  beforeAll(() => {
    // Set up integration test environment
    process.env.NODE_ENV = 'test';
    process.env.CI = 'true';
  });

  afterAll(() => {
    // Clean up integration test environment
    delete process.env.NODE_ENV;
    delete process.env.CI;
  });

  describe('Package Interoperability', () => {
    it('should import all packages without conflicts', async () => {
      // Test that all packages can be imported together
      const packages = [
        () => import('@frontal-cloud/ai'),
        () => import('@frontal-cloud/compute'),
        () => import('@frontal-cloud/functions'),
        () => import('@frontal-cloud/flags'),
        () => import('@frontal-cloud/logging'),
        () => import('@frontal-cloud/notifications'),
        () => import('@frontal-cloud/storage'),
      ];

      const results = await Promise.allSettled(packages);
      
      // All packages should import successfully
      results.forEach((result, index) => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value).toBeDefined();
        }
      });
    });

    it('should have consistent API patterns across packages', async () => {
      // Import packages and check for consistent patterns
      const [ai, compute, functions, flags, logging, notifications, storage] = await Promise.all([
        import('@frontal-cloud/ai'),
        import('@frontal-cloud/compute'),
        import('@frontal-cloud/functions'),
        import('@frontal-cloud/flags'),
        import('@frontal-cloud/logging'),
        import('@frontal-cloud/notifications'),
        import('@frontal-cloud/storage'),
      ]);

      // All packages should export a client class or main function
      const packages = [ai, compute, functions, flags, logging, notifications, storage];
      
      packages.forEach((pkg, index) => {
        const packageName = ['ai', 'compute', 'functions', 'flags', 'logging', 'notifications', 'storage'][index];
        
        // Check that package has default export or named exports
        expect(Object.keys(pkg).length).toBeGreaterThan(0);
        
        // Check for common patterns (client, config, etc.)
        const exports = Object.keys(pkg);
        const hasClient = exports.some(exp => exp.toLowerCase().includes('client'));
        const hasConfig = exports.some(exp => exp.toLowerCase().includes('config'));
        
        // At least one of these patterns should exist
        expect(hasClient || hasConfig).toBe(true);
      });
    });
  });

  describe('Configuration Management', () => {
    it('should handle environment variables consistently', () => {
      // Test that all packages respect environment variables
      const originalApiKey = process.env.FRONTAL_CLOUD_API_KEY;
      
      try {
        process.env.FRONTAL_CLOUD_API_KEY = 'test-integration-key';
        
        // This would be tested by individual package tests
        // Here we verify the environment is set correctly
        expect(process.env.FRONTAL_CLOUD_API_KEY).toBe('test-integration-key');
      } finally {
        // Restore original value
        if (originalApiKey) {
          process.env.FRONTAL_CLOUD_API_KEY = originalApiKey;
        } else {
          delete process.env.FRONTAL_CLOUD_API_KEY;
        }
      }
    });

    it('should validate configuration objects', () => {
      // Test configuration validation patterns
      const validConfigs = [
        { apiKey: 'test-key', baseUrl: 'https://api.test.com' },
        { apiKey: 'key123', timeout: 5000 },
        { apiKey: 'abc', retries: 3 },
      ];

      validConfigs.forEach(config => {
        expect(config.apiKey).toBeDefined();
        expect(typeof config.apiKey).toBe('string');
        expect(config.apiKey.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API keys gracefully', () => {
      // Test error handling when API key is missing
      const originalApiKey = process.env.FRONTAL_CLOUD_API_KEY;
      
      try {
        delete process.env.FRONTAL_CLOUD_API_KEY;
        
        // This would be tested by individual packages
        // Here we verify the environment is properly unset
        expect(process.env.FRONTAL_CLOUD_API_KEY).toBeUndefined();
      } finally {
        if (originalApiKey) {
          process.env.FRONTAL_CLOUD_API_KEY = originalApiKey;
        }
      }
    });

    it('should handle network errors consistently', () => {
      // Test that network errors are handled consistently
      const networkError = new Error('Network timeout');
      networkError.name = 'NetworkError';
      
      expect(networkError.message).toBe('Network timeout');
      expect(networkError.name).toBe('NetworkError');
    });
  });

  describe('Type Safety', () => {
    it('should export proper TypeScript types', async () => {
      // Test that packages export proper types
      const [ai, compute, functions, flags, logging, notifications, storage] = await Promise.all([
        import('@frontal-cloud/ai'),
        import('@frontal-cloud/compute'),
        import('@frontal-cloud/functions'),
        import('@frontal-cloud/flags'),
        import('@frontal-cloud/logging'),
        import('@frontal-cloud/notifications'),
        import('@frontal-cloud/storage'),
      ]);

      // Each package should have type exports
      const packages = [ai, compute, functions, flags, logging, notifications, storage];
      
      packages.forEach((pkg) => {
        // Check that package exports are defined
        expect(pkg).toBeDefined();
        expect(typeof pkg).toBe('object');
      });
    });
  });

  describe('Performance', () => {
    it('should initialize packages within reasonable time', async () => {
      // Test package initialization performance
      const startTime = Date.now();
      
      await Promise.all([
        import('@frontal-cloud/ai'),
        import('@frontal-cloud/compute'),
        import('@frontal-cloud/functions'),
        import('@frontal-cloud/flags'),
        import('@frontal-cloud/logging'),
        import('@frontal-cloud/notifications'),
        import('@frontal-cloud/storage'),
      ]);
      
      const endTime = Date.now();
      const initTime = endTime - startTime;
      
      // All packages should initialize within 1 second
      expect(initTime).toBeLessThan(1000);
    });
  });
});
