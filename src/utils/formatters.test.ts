import { formatCurrency, formatNumber, formatPercent } from './formatters';

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    it('should format number to CNY currency', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56');
      expect(formatCurrency(0)).toBe('¥0.00');
      expect(formatCurrency(1000000)).toBe('¥1,000,000.00');
    });
  });

  describe('formatNumber', () => {
    it('should format number with default 2 decimal places', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(0)).toBe('0.00');
    });

    it('should format number with specified decimal places', () => {
      expect(formatNumber(1234.56789, 3)).toBe('1,234.568');
      expect(formatNumber(1234, 0)).toBe('1,234');
    });
  });

  describe('formatPercent', () => {
    it('should format number as percentage', () => {
      expect(formatPercent(50)).toBe('50.00%');
      expect(formatPercent(0)).toBe('0.00%');
      expect(formatPercent(100)).toBe('100.00%');
    });

    it('should format number as percentage with specified decimal places', () => {
      expect(formatPercent(50.123, 1)).toBe('50.1%');
      expect(formatPercent(25.5, 0)).toBe('26%');
    });
  });
});
