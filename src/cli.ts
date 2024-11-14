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

export enum ExitMessages {
  NO_ARGS = 'You must pass either a text argument or --stdin',
  BOTH_ARGS = 'You cannot pass both a text argument and --stdin',
  STREAM_PROCESS = 'Failed to conspirafy stdin. Error message: ',
}

export const runCommand = async (text: string | undefined, opts: Options) => {
  if (!text && !opts.stdin) {
    return console.error(ExitMessages.NO_ARGS);
  }

  if (text && opts.stdin) {
    return console.error(ExitMessages.BOTH_ARGS);
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
      return;
    } catch (streamError) {
      console.log('here?');
      return console.error(
        ExitMessages.STREAM_PROCESS,
        (streamError as Error).message,
      );
    }
  }

  if (!opts.stdin && text) {
    const result = conspirafy(text);
    process.stdout.write(result);
    return;
  }
};

const main = async () => {
  await program
    .version('1.0.2', '-v, --vers', 'Output the current version')
    .description('Conspirafy some text!')
    .argument('[text]', 'The text to conspirafy')
    .option('-s, --stdin', 'Read from stdin instead of passing text')
    .action(runCommand)
    .parseAsync(process.argv);
};

main();
