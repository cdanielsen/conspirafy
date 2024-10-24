#! /usr/bin/env node
import { pipeline } from 'node:stream/promises';
import { stdin, stdout } from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { conspirafy } from '../dist/index.js';
import { Transform } from 'node:stream';

yargs(hideBin(process.argv))
  .scriptName('conspirafy')
  .command(
    '$0 [text] [options]',
    'Conspirafy some text!',
    (yargs) => {
      yargs.option('stdin', {
        alias: 's',
        type: 'boolean',
        description: 'Read from stdin instead of passing text',
      });
      yargs.positional('text', {
        description: 'A required text argument (unless --stdin is passed)',
        type: 'string',
        conflicts: 'stdin',
      });
      yargs.check((argv) => {
        if (!argv.text && !argv.stdin) {
          throw new Error('You must pass a text argument if not using --stdin');
        }
        return true;
      });
    },
    async ({ text, stdin: stdinArg }) => {
      // Read from stdin if the --stdin or -s flag is passed
      if (stdinArg) {
        const conspirafyText = new Transform({
          transform(chunk, encoding, callback) {
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
      const result = conspirafy(text);
      process.stdout.write(result);
    },
  )
  .example('$0 "The moon landing was a hoax"')
  .help()
  .parse();
