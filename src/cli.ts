#! /usr/bin/env node
import { pipeline } from 'node:stream/promises';
import { stdin, stdout } from 'node:process';
import { conspirafy } from './conspirafy.js';
import { Transform } from 'node:stream';
import { Command } from 'commander';
const program = new Command('conspirafy');

interface Options {
  stdin: boolean;
}

export const runCommand = async (text: string | undefined, opts: Options) => {
  if (!text && !opts.stdin) {
    console.error('You must pass a text argument if not using --stdin');
    process.exit(1);
  }

  if (text && opts.stdin) {
    console.error('You cannot pass a text argument if using --stdin');
    process.exit(1);
  }

  if (opts.stdin && !text) {
    const conspirafyText = new Transform({
      transform(chunk, _, callback) {
        this.push(conspirafy(chunk.toString()));
        callback();
      },
    });
    try {
      await pipeline(stdin, conspirafyText, stdout);
      process.exit(0);
    } catch (err) {
      console.error('Failed to conspirafy stdin =/', err);
      process.exit(1);
    }
  }

  if (!opts.stdin && text) {
    const result = conspirafy(text);
    process.stdout.write(result);
  }
};

program
  .version('1.0.2', '-v, --vers', 'Output the current version')
  .description('Conspirafy some text!')
  .argument('[text]', 'The text to conspirafy')
  .option('-s, --stdin', 'Read from stdin instead of passing text')
  .action(runCommand)
  .parse();
