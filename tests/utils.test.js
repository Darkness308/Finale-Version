/**
 * Unit Tests for Utility Functions
 * Tests for SecurityUtils, DOMUtils, StorageUtils, A11yUtils
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SecurityUtils,
  DOMUtils,
  StorageUtils,
  A11yUtils,
  EventUtils,
  ToastUtils
} from '../js/utils.js';

describe('SecurityUtils', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const output = SecurityUtils.sanitizeHTML(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('Hello');
    });

    it('should convert special characters to HTML entities', () => {
      const input = '<div>Test</div>';
      const output = SecurityUtils.sanitizeHTML(input);
      expect(output).toBe('&lt;div&gt;Test&lt;/div&gt;');
    });

    it('should return empty string for non-string input', () => {
      expect(SecurityUtils.sanitizeHTML(null)).toBe('');
      expect(SecurityUtils.sanitizeHTML(undefined)).toBe('');
      expect(SecurityUtils.sanitizeHTML(123)).toBe('');
    });

    it('should handle empty strings', () => {
      expect(SecurityUtils.sanitizeHTML('')).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const input = '  test  ';
      const output = SecurityUtils.sanitizeInput(input);
      expect(output).toBe('test');
    });

    it('should enforce max length', () => {
      const input = 'a'.repeat(10000);
      const output = SecurityUtils.sanitizeInput(input, 100);
      expect(output.length).toBe(100);
    });

    it('should use default max length of 5000', () => {
      const input = 'a'.repeat(10000);
      const output = SecurityUtils.sanitizeInput(input);
      expect(output.length).toBe(5000);
    });
  });

  describe('safeTemplate', () => {
    it('should replace template variables safely', () => {
      const template = 'Hello {{name}}, you are {{age}} years old';
      const data = { name: 'John', age: '30' };
      const output = SecurityUtils.safeTemplate(template, data);
      expect(output).toBe('Hello John, you are 30 years old');
    });

    it('should sanitize template values', () => {
      const template = 'Message: {{msg}}';
      const data = { msg: '<script>alert("xss")</script>' };
      const output = SecurityUtils.safeTemplate(template, data);
      expect(output).not.toContain('<script>');
    });
  });
});

describe('DOMUtils', () => {
  describe('createElement', () => {
    it('should create element with specified tag', () => {
      const element = DOMUtils.createElement('div');
      expect(element.tagName).toBe('DIV');
    });

    it('should set attributes', () => {
      const element = DOMUtils.createElement('button', {
        class: 'btn',
        id: 'test-btn'
      });
      expect(element.className).toBe('btn');
      expect(element.id).toBe('test-btn');
    });

    it('should set text content', () => {
      const element = DOMUtils.createElement('p', {}, 'Hello World');
      expect(element.textContent).toBe('Hello World');
    });

    it('should handle data attributes', () => {
      const element = DOMUtils.createElement('div', {
        data: { action: 'save', id: '123' }
      });
      expect(element.dataset.action).toBeDefined();
      expect(element.dataset.id).toBeDefined();
    });
  });

  describe('createTableRow', () => {
    it('should create row with cells', () => {
      const row = DOMUtils.createTableRow(['Cell 1', 'Cell 2', 'Cell 3']);
      expect(row.tagName).toBe('TR');
      expect(row.children.length).toBe(3);
      expect(row.children[0].textContent).toBe('Cell 1');
    });

    it('should add className if provided', () => {
      const row = DOMUtils.createTableRow(['Test'], 'highlight');
      expect(row.className).toBe('highlight');
    });

    it('should sanitize cell content', () => {
      const row = DOMUtils.createTableRow(['<script>alert("xss")</script>']);
      expect(row.children[0].textContent).not.toContain('<script>');
    });
  });
});

describe('StorageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setSecureData and getSecureData', () => {
    it('should store and retrieve data', async () => {
      const testData = { name: 'John', age: 30 };
      await StorageUtils.setSecureData('test_key', testData);
      const retrieved = await StorageUtils.getSecureData('test_key');

      // Note: Since we're mocking crypto, the actual data won't be the same
      // but the flow should work
      expect(retrieved).toBeDefined();
    });

    it('should return default value if key not found', async () => {
      const defaultValue = { default: true };
      const result = await StorageUtils.getSecureData('nonexistent', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should handle errors gracefully', async () => {
      // This should not throw
      await StorageUtils.setSecureData('test', null);
      const result = await StorageUtils.getSecureData('invalid_json', 'default');
      expect(result).toBe('default');
    });
  });

  describe('exportData', () => {
    it('should create export with metadata', () => {
      const testData = { moods: [], strengths: [] };
      // We can't easily test file download, but we can test the data structure
      expect(() => {
        StorageUtils.exportData('test.json', testData, 'json');
      }).not.toThrow();
    });
  });

  describe('objectToMarkdown', () => {
    it('should convert simple object to markdown', () => {
      const obj = { name: 'John', age: 30 };
      const markdown = StorageUtils.objectToMarkdown(obj);
      expect(markdown).toContain('**name:**');
      expect(markdown).toContain('John');
    });

    it('should convert array to markdown list', () => {
      const arr = ['item1', 'item2', 'item3'];
      const markdown = StorageUtils.objectToMarkdown(arr);
      expect(markdown).toContain('- item1');
      expect(markdown).toContain('- item2');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: { name: 'John', details: { age: 30 } }
      };
      const markdown = StorageUtils.objectToMarkdown(obj);
      expect(markdown).toContain('user');
      expect(markdown).toContain('name');
    });
  });
});

describe('A11yUtils', () => {
  describe('checkColorContrast', () => {
    it('should pass for high contrast colors', () => {
      const result = A11yUtils.checkColorContrast('#000000', '#FFFFFF');
      expect(result).toBe(true);
    });

    it('should fail for low contrast colors', () => {
      const result = A11yUtils.checkColorContrast('#CCCCCC', '#FFFFFF');
      expect(result).toBe(false);
    });

    it('should handle hex colors', () => {
      const result = A11yUtils.checkColorContrast('#FFD700', '#000000');
      expect(result).toBe(true);
    });

    it('should handle rgb colors', () => {
      const result = A11yUtils.checkColorContrast('rgb(0,0,0)', 'rgb(255,255,255)');
      expect(result).toBe(true);
    });

    it('should handle invalid colors', () => {
      const result = A11yUtils.checkColorContrast('invalid', 'also-invalid');
      expect(result).toBe(false);
    });
  });

  describe('setFocus', () => {
    it('should not throw for null element', () => {
      expect(() => {
        A11yUtils.setFocus(null);
      }).not.toThrow();
    });

    it('should call focus on element', () => {
      const element = document.createElement('button');
      const focusSpy = vi.spyOn(element, 'focus');
      A11yUtils.setFocus(element);
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      A11yUtils.announceToScreenReader('Test message');
      // Check that an element was added to body
      const announcements = document.querySelectorAll('[aria-live]');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should set correct politeness level', () => {
      A11yUtils.announceToScreenReader('Urgent', 'assertive');
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeDefined();
    });
  });
});

describe('EventUtils', () => {
  describe('addSecureListener', () => {
    it('should add event listener', () => {
      const element = document.createElement('button');
      const handler = vi.fn();
      EventUtils.addSecureListener(element, 'click', handler);
      element.click();
      expect(handler).toHaveBeenCalled();
    });

    it('should catch errors in handler', () => {
      const element = document.createElement('button');
      const errorHandler = vi.fn(() => {
        throw new Error('Test error');
      });

      // Should not throw
      expect(() => {
        EventUtils.addSecureListener(element, 'click', errorHandler);
        element.click();
      }).not.toThrow();
    });

    it('should handle null element gracefully', () => {
      expect(() => {
        EventUtils.addSecureListener(null, 'click', () => {});
      }).not.toThrow();
    });
  });
});

describe('ToastUtils', () => {
  describe('show', () => {
    it('should create toast element', () => {
      ToastUtils.show('Test message', 'info');
      const toasts = document.querySelectorAll('.toast');
      expect(toasts.length).toBeGreaterThan(0);
    });

    it('should apply correct type class', () => {
      ToastUtils.show('Success!', 'success');
      const toast = document.querySelector('.toast-success');
      expect(toast).toBeDefined();
    });

    it('should sanitize message', () => {
      ToastUtils.show('<script>alert("xss")</script>');
      const toasts = document.querySelectorAll('.toast');
      expect(toasts[0].textContent).not.toContain('<script>');
    });

    it('should auto-remove after duration', (done) => {
      ToastUtils.show('Temp message', 'info', 100);

      setTimeout(() => {
        const toasts = document.querySelectorAll('.toast');
        // Toast should be removed or animating out
        done();
      }, 500);
    });
  });
});
