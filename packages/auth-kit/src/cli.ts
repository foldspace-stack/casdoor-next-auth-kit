#!/usr/bin/env node
import { runCli } from './cli/index';

runCli(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
