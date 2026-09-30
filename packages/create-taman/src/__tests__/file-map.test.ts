// @vitest-environment node
import { chmodSync, mkdirSync, mkdtempSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { decodeFile, readFileMap, writeFileMap } from '../file-map';

describe('decodeFile', () => {
  it('keeps UTF-8 text as a string and NUL-containing bytes as binary', () => {
    expect(decodeFile(new TextEncoder().encode('héllo'))).toBe('héllo');
    expect(decodeFile(new Uint8Array([0x89, 0x50, 0x00, 0x47]))).toBeInstanceOf(Uint8Array);
  });
});

describe('readFileMap / writeFileMap', () => {
  it('round-trips nested files with posix paths and skips .git', () => {
    const source = mkdtempSync(join(tmpdir(), 'ct-src-'));
    mkdirSync(join(source, 'a/b'), { recursive: true });
    mkdirSync(join(source, '.git'));
    writeFileSync(join(source, 'a/b/c.txt'), 'text');
    writeFileSync(join(source, '.git/HEAD'), 'ref');

    const files = readFileMap(source);
    expect([...files.keys()]).toEqual(['a/b/c.txt']);

    const target = mkdtempSync(join(tmpdir(), 'ct-out-'));
    writeFileMap(target, files, source);
    expect(readFileMap(target).get('a/b/c.txt')).toBe('text');
  });

  it('preserves the executable bit from the source tree', () => {
    const source = mkdtempSync(join(tmpdir(), 'ct-src-'));
    writeFileSync(join(source, 'run.sh'), '#!/bin/sh\n');
    chmodSync(join(source, 'run.sh'), 0o755);

    const target = mkdtempSync(join(tmpdir(), 'ct-out-'));
    writeFileMap(target, readFileMap(source), source);

    expect(statSync(join(target, 'run.sh')).mode & 0o111).not.toBe(0);
  });
});
