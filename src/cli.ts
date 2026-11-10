#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { conspirafy } from './conspirafy.js';

const USAGE = `Usage: conspirafy <text>

Conspirafy some text

Options:
  --help     Show help
  --version  Show version number

Examples:
  conspirafy "The moon landing was a hoax"`;

const exitWithUsage = (message: string): never => {
  console.error(`${message}\n\n${USAGE}`);
  process.exit(1);
};

const parseCliArgs = () => {
  try {
    return parseArgs({
      allowPositionals: true,
      strict: true,
      options: {
        help: { type: 'boolean' },
        version: { type: 'boolean' },
      },
    });
  } catch (error) {
    return exitWithUsage((error as Error).message);
  }
};

const { values, positionals } = parseCliArgs();

if (values.help) {
  console.log(USAGE);
} else if (values.version) {
  const packageJson = new URL('../package.json', import.meta.url);
  console.log(JSON.parse(readFileSync(packageJson, 'utf8')).version);
} else if (positionals.length === 0) {
  exitWithUsage('Missing required argument: text');
} else {
  console.log(conspirafy(positionals.join(' ')));
}
