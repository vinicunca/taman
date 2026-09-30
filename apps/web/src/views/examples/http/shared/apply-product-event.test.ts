import { describe, expect, it } from 'vitest';
import { applyCreatedProduct, applyDeletedProduct, applyUpdatedProduct } from './apply-product-event';

const firstPage = { products: [{ id: 1, title: 'A', price: 1 }, { id: 2, title: 'B', price: 2 }], total: 12, skip: 0, limit: 2 };
const secondPage = { products: [{ id: 3, title: 'C', price: 3 }, { id: 4, title: 'D', price: 4 }], total: 12, skip: 2, limit: 2 };

describe('applyCreatedProduct', () => {
  it('prepends the new row on the first page (skip 0) and trims it to its own limit', () => {
    const result = applyCreatedProduct(firstPage, { id: 99, title: 'New', price: 9 });
    expect(result.products).toEqual([
      { id: 99, title: 'New', price: 9 },
      { id: 1, title: 'A', price: 1 },
    ]);
    expect(result.products).toHaveLength(firstPage.limit);
    expect(result.total).toBe(13);
  });

  it('leaves a later page (skip > 0) untouched except for the bumped total', () => {
    const result = applyCreatedProduct(secondPage, { id: 99, title: 'New', price: 9 });
    expect(result.products).toEqual(secondPage.products);
    expect(result.total).toBe(13);
  });
});

describe('applyUpdatedProduct', () => {
  it('replaces the matching row wherever it appears', () => {
    const result = applyUpdatedProduct(secondPage, { id: 3, title: 'C updated', price: 30 });
    expect(result.products).toEqual([
      { id: 3, title: 'C updated', price: 30 },
      { id: 4, title: 'D', price: 4 },
    ]);
    expect(result.total).toBe(secondPage.total);
  });

  it('is a no-op for a page that does not contain the row', () => {
    const result = applyUpdatedProduct(firstPage, { id: 3, title: 'C updated', price: 30 });
    expect(result.products).toEqual(firstPage.products);
  });
});

describe('applyDeletedProduct', () => {
  it('removes the matching row and decrements total on the page that has it', () => {
    const result = applyDeletedProduct(firstPage, 1);
    expect(result.products).toEqual([{ id: 2, title: 'B', price: 2 }]);
    expect(result.total).toBe(11);
  });

  it('decrements total on every other cached page too, even without the row', () => {
    const result = applyDeletedProduct(secondPage, 1);
    expect(result.products).toEqual(secondPage.products);
    expect(result.total).toBe(11);
  });
});
