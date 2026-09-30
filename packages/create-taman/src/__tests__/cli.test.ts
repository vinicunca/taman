import { describe, expect, it } from 'vitest';
import { defaultRef, parseCliArgs } from '../cli';

describe('parseCliArgs', () => {
  it('reads the folder and flags', () => {
    expect(parseCliArgs(['my-app', '--scope', '@acme', '--ref', 'main', '--yes', '--no-install', '--no-git'])).toEqual({
      dir: 'my-app',
      from: undefined,
      git: false,
      help: false,
      install: false,
      ref: 'main',
      scope: '@acme',
      yes: true,
    });
  });

  it('defaults to installing and committing', () => {
    expect(parseCliArgs([])).toMatchObject({ git: true, install: true, yes: false });
  });
});

describe('defaultRef', () => {
  it('pins the template to this CLI release tag', () => {
    expect(defaultRef()).toMatch(/^create-taman@\d+\.\d+\.\d+/);
  });
});
