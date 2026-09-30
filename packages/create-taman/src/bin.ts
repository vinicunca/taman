#!/usr/bin/env node
import process from 'node:process';
import { main } from './cli';

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
