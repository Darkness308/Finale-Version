/**
 * Vitest Test Setup
 * Runs before all tests to initialize the test environment
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

global.localStorage = localStorageMock;

// Mock crypto.subtle for encryption tests
if (!global.crypto) {
  global.crypto = {};
}

if (!global.crypto.subtle) {
  global.crypto.subtle = {
    digest: vi.fn(async (algorithm, data) => {
      // Simple mock - returns a fixed ArrayBuffer
      return new ArrayBuffer(32);
    }),
    importKey: vi.fn(async () => ({})),
    encrypt: vi.fn(async () => new ArrayBuffer(16)),
    decrypt: vi.fn(async () => new TextEncoder().encode('{"data":"test"}'))
  };
}

if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  });
}

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
});
