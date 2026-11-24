import {
  removeVietnameseTones,
  extractSearchTokens,
  generateSearchText,
  calculateRelevanceScore,
} from './search-helper';

describe('SearchHelper Unit Tests', () => {
  describe('removeVietnameseTones', () => {
    it('should correctly strip Vietnamese diacritics', () => {
      const input = 'Điện thoại thông minh iPhone 15 Pro Max';
      const output = removeVietnameseTones(input);
      expect(output).toBe('dien thoai thong minh iphone 15 pro max');
    });

    it('should handle uppercase Đ and lowercase đ correctly', () => {
      expect(removeVietnameseTones('Đồng Hồ Đeo Tay Đà Nẵng')).toBe('dong ho deo tay da nang');
    });

    it('should return empty string for null or empty inputs', () => {
      expect(removeVietnameseTones('')).toBe('');
      // @ts-expect-error testing falsy
      expect(removeVietnameseTones(null)).toBe('');
    });
  });

  describe('extractSearchTokens', () => {
    it('should split query into individual clean tokens', () => {
      const tokens = extractSearchTokens('tai nghe bluetooth sony');
      expect(tokens).toEqual(['tai', 'nghe', 'bluetooth', 'sony']);
    });

    it('should filter out special punctuation and symbols', () => {
      const tokens = extractSearchTokens('áo thun @nam #đẹp (size L)!');
      expect(tokens).toEqual(['áo', 'thun', 'nam', 'đẹp', 'size', 'L']);
    });

    it('should return empty array for whitespace-only input', () => {
      expect(extractSearchTokens('   ')).toEqual([]);
    });
  });

  describe('generateSearchText', () => {
    it('should combine and deduplicate keywords with both tone and toneless versions', () => {
      const searchText = generateSearchText({
        name: 'Bàn phím cơ không dây',
        brandName: 'Logitech',
        categoryName: 'Bàn phím',
        shopName: 'TechStore',
      });

      expect(searchText).toContain('bàn');
      expect(searchText).toContain('ban');
      expect(searchText).toContain('phim');
      expect(searchText).toContain('logitech');
      expect(searchText).toContain('techstore');
    });
  });

  describe('calculateRelevanceScore', () => {
    const product = {
      name: 'Điện thoại Apple iPhone 15 Pro Max 256GB',
      searchText: 'dien thoai apple iphone 15 pro max 256gb',
      brandName: 'Apple',
      categoryName: 'Điện thoại',
    };

    it('should give highest score (100) when name starts with exact query', () => {
      const score = calculateRelevanceScore(product, 'Điện thoại');
      expect(score).toBe(100);
    });

    it('should give high score (80) when query is an exact substring within name', () => {
      const score = calculateRelevanceScore(product, 'iPhone 15');
      expect(score).toBe(80);
    });

    it('should give score (60) when query matches without Vietnamese tones', () => {
      const score = calculateRelevanceScore(product, 'dien thoai');
      expect(score).toBe(70); // starts with normalized query
    });

    it('should score lower for partial non-consecutive tokens', () => {
      const score = calculateRelevanceScore(product, 'apple 256gb');
      expect(score).toBeGreaterThanOrEqual(40);
    });

    it('should return 0 when query does not match', () => {
      const score = calculateRelevanceScore(product, 'Tủ lạnh Samsung');
      expect(score).toBe(0);
    });
  });
});
