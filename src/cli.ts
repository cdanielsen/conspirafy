#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { parseArgs } from 'node:util';
import { conspirafy } from './conspirafy.js';

const USAGE = `Usage: conspirafy <text>
       <command> | conspirafy

Conspirafy some text, passed as arguments or piped in

Options:
  --help     Show help
  --version  Show version number

Examples:
  conspirafy "The moon landing was a hoax"
  cat manifesto.txt | conspirafy > mYmAnifesto.txt`;

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

// Returns whether any input arrived. setEncoding keeps multi-byte characters
// whole when they are split across chunks.
const conspirafyStdin = async (): Promise<boolean> => {
  let receivedInput = false;
  process.stdin.setEncoding('utf8');

  try {
    await pipeline(
      process.stdin,
      async function* (chunks: AsyncIterable<string>) {
        for await (const chunk of chunks) {
          receivedInput = true;
          yield conspirafy(chunk);
        }
      },
      process.stdout,
    );
  } catch (error) {
    const { code, message } = error as NodeJS.ErrnoException;
    // The reader went away, e.g. `conspirafy | head -1`.
    if (code !== 'EPIPE') {
      console.error(`Failed to conspirafy stdin: ${message}`);
      process.exit(1);
    }
  }

  return receivedInput;
};

const { values, positionals } = parseCliArgs();

if (values.help) {
  console.log(USAGE);
} else if (values.version) {
  const packageJson = new URL('../package.json', import.meta.url);
  console.log(JSON.parse(readFileSync(packageJson, 'utf8')).version);
} else if (positionals.length > 0) {
  console.log(conspirafy(positionals.join(' ')));
} else if (process.stdin.isTTY || !(await conspirafyStdin())) {
  exitWithUsage('Missing text: pass it as an argument or pipe it in');
}
