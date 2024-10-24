#! /usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { conspirafy } from '../dist/index.js';

// const yargs = require('yargs');
// const { conspirafy } = require('../dist');

yargs(hideBin(process.argv))
  .command(
    '$0 <text>',
    'Conspirafy some text',
    (yargs) => {
      yargs.positional('text', {
        describe: 'A required argument',
        type: 'string',
        demandOption: true,
      });
    },
    ({ text }) => {
      const result = conspirafy(text);
      console.log(result);
    },
  )
  .example('$0 "The moon landing was a hoax"')
  .help()
  .parse();
