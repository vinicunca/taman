import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatDate,
  formatDateTime,
  getCurrentTimezone,
  getSystemTimezone,
  getTimezoneOptions,
  setCurrentTimezone,
} from '../date';

describe('dateUtils', () => {
  const sampleISO = '2024-10-30T12:34:56Z';
  const sampleTimestamp = Date.parse(sampleISO);

  beforeEach(() => {
    setCurrentTimezone('UTC');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatDate', () => {
    it('should format a valid ISO date string', () => {
      expect(formatDate(sampleISO, 'YYYY/MM/DD')).toBe('2024/10/30');
    });

    it('should format a timestamp correctly', () => {
      expect(formatDate(sampleTimestamp)).toBe('2024-10-30');
    });

    it('should format a Date object', () => {
      expect(formatDate(new Date(sampleISO))).toBe('2024-10-30');
    });

    it('should return original input if date is invalid', () => {
      const invalid = 'not-a-date';
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const formatted = formatDate(invalid);
      expect(formatted).toBe(invalid);
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should apply given format', () => {
      expect(formatDate(sampleISO, 'YYYY-MM-DD HH:mm')).toBe('2024-10-30 12:34');
    });

    it('should format in the configured timezone', () => {
      setCurrentTimezone('America/New_York');
      expect(formatDate('2024-01-01T00:00:00Z', 'YYYY-MM-DD HH:mm')).toBe(
        '2023-12-31 19:00',
      );
    });
  });

  describe('formatDateTime', () => {
    it('should format date into full datetime', () => {
      expect(formatDateTime(sampleISO)).toBe('2024-10-30 12:34:56');
    });
  });

  describe('getSystemTimezone', () => {
    it('should return a valid IANA timezone string', () => {
      const tz = getSystemTimezone();
      expect(typeof tz).toBe('string');
      expect(tz).toMatch(/^[A-Z]+\/[A-Z_]+/i);
    });
  });

  describe('setCurrentTimezone & getCurrentTimezone', () => {
    it('should set and retrieve the current timezone', () => {
      setCurrentTimezone('Asia/Shanghai');
      expect(getCurrentTimezone()).toBe('Asia/Shanghai');
    });

    it('should reset to system timezone when called with no args', () => {
      const guessed = getSystemTimezone();
      setCurrentTimezone();
      expect(getCurrentTimezone()).toBe(guessed);
    });
  });

  describe('getTimezoneOptions', () => {
    it('should include common IANA timezones', () => {
      const options = getTimezoneOptions('en-US');
      const values = options.map((item) => item.value);

      expect(values).toContain('America/New_York');
      expect(values).toContain('Asia/Makassar');
      expect(options.length).toBeGreaterThan(100);
    });

    it('should format labels with an offset', () => {
      const option = getTimezoneOptions('en-US').find(
        (item) => item.value === 'Asia/Makassar',
      );

      expect(option).toBeDefined();
      expect(option?.label).toContain('Asia/Makassar');
      expect(option?.label).toMatch(/GMT|UTC|[+-]\d/);
    });

    it('should reuse the catalog for the same locale', () => {
      const first = getTimezoneOptions('en-US');
      const second = getTimezoneOptions('en-US');

      expect(first).toBe(second);
    });
  });
});
