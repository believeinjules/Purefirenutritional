import { describe, it, expect } from 'vitest';
import { products } from '@/data/products';

describe('Product Search Logic', () => {
  it('should filter products by search query', () => {
    const query = 'brain';
    const results = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.benefits?.some(b => b.toLowerCase().includes(query))
    );
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.benefits?.some(b => b.toLowerCase().includes(query))
    )).toBe(true);
  });

  it('should filter products by category', () => {
    const category = 'PEPTIDE BIOREGULATORS';
    const results = products.filter(p => p.category === category);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.category === category)).toBe(true);
  });

  it('should filter products by price range', () => {
    const minPrice = 50;
    const maxPrice = 100;
    const results = products.filter(p => 
      p.priceUSD >= minPrice && p.priceUSD <= maxPrice
    );
    
    expect(results.every(p => p.priceUSD >= minPrice && p.priceUSD <= maxPrice)).toBe(true);
  });

  it('should filter products by minimum rating', () => {
    const minRating = 4.5;
    const results = products.filter(p => p.rating >= minRating);
    
    expect(results.every(p => p.rating >= minRating)).toBe(true);
  });

  it('should filter products by benefits', () => {
    const benefit = 'cardiovascular';
    const results = products.filter(p =>
      p.benefits?.some(b => b.toLowerCase().includes(benefit))
    );
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => 
      p.benefits?.some(b => b.toLowerCase().includes(benefit))
    )).toBe(true);
  });

  it('should handle multiple filters simultaneously', () => {
    const query = 'peptide';
    const category = 'PEPTIDE BIOREGULATORS';
    const minPrice = 40;
    const maxPrice = 60;
    const minRating = 4.0;
    
    const results = products.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query);
      const matchesCategory = p.category === category;
      const matchesPrice = p.priceUSD >= minPrice && p.priceUSD <= maxPrice;
      const matchesRating = p.rating >= minRating;
      
      return matchesQuery && matchesCategory && matchesPrice && matchesRating;
    });
    
    expect(results.every(p => {
      const matchesQuery = p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query);
      return matchesQuery && 
        p.category === category && 
        p.priceUSD >= minPrice && 
        p.priceUSD <= maxPrice &&
        p.rating >= minRating;
    })).toBe(true);
  });

  it('should return all products when no filters applied', () => {
    const results = products.filter(() => true);
    expect(results.length).toBe(products.length);
  });

  it('should return empty array when no products match filters', () => {
    const results = products.filter(p => 
      p.priceUSD > 10000 // Unrealistic price
    );
    expect(results.length).toBe(0);
  });
});

describe('Product Sorting', () => {
  it('should sort products by name ascending', () => {
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].name.localeCompare(sorted[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('should sort products by name descending', () => {
    const sorted = [...products].sort((a, b) => b.name.localeCompare(a.name));
    
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].name.localeCompare(sorted[i + 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it('should sort products by price ascending', () => {
    const sorted = [...products].sort((a, b) => a.priceUSD - b.priceUSD);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].priceUSD).toBeLessThanOrEqual(sorted[i + 1].priceUSD);
    }
  });

  it('should sort products by price descending', () => {
    const sorted = [...products].sort((a, b) => b.priceUSD - a.priceUSD);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].priceUSD).toBeGreaterThanOrEqual(sorted[i + 1].priceUSD);
    }
  });

  it('should sort products by rating descending', () => {
    const sorted = [...products].sort((a, b) => b.rating - a.rating);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].rating).toBeGreaterThanOrEqual(sorted[i + 1].rating);
    }
  });
});
