import { describe, expect, it } from 'vitest';
import { normalizeScope, toNames, validateName } from '../names';

describe('names', () => {
  it('accepts lowercase npm names and rejects the rest with a reason', () => {
    expect(validateName('my-app', 'Project name')).toBeUndefined();
    expect(validateName('', 'Scope')).toBe('Scope is required');
    expect(validateName('Acme', 'Scope')).toMatch(/lowercase/);
    expect(validateName('_acme', 'Scope')).toMatch(/start with a letter or digit/);
  });

  it('normalises typed scope forms', () => {
    expect(normalizeScope('@acme')).toBe('acme');
    expect(normalizeScope('@acme/')).toBe('acme');
    expect(normalizeScope(' acme ')).toBe('acme');
  });

  it('derives a database-safe name', () => {
    expect(toNames('my-app.v2', 'acme').nameSnake).toBe('my_app_v2');
  });
});
