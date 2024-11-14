import { describe, test, expect } from 'vitest';
import { execa, execaNode } from 'execa';
import { ExitMessages } from './cli.js';
import { Readable } from 'stream';

describe('conspirafy', () => {
  test('it should error if neither text or the --stdin flag is passed', async () => {
    const { stderr } = await execaNode`./dist/cli.js`;
    expect(stderr).toEqual(ExitMessages.NO_ARGS);
  });

  test('it should error if both text and the --stdin flag are passed', async () => {
    const { stderr } = await execaNode`./dist/cli.js "hello" --stdin`;
    expect(stderr).toEqual(ExitMessages.BOTH_ARGS);
  });

  // TODO: This fuckng test is failing because it's throwing an
  // ExecaError?! From the docs, it seems like execa will throw if the input stream
  // is throwing an error: https://github.com/sindresorhus/execa/blob/main/docs/errors.md#failure-reason
  // but that's the exact scernario we're testing here >.>
  // What I don't understand is why it's not being caught
  // by the try/catch block in the actual code?!
  test.skip('it should log an error if the stdin stream fails', async () => {
    const input = new Readable({
      read() {},
    });
    const runningCommand = execaNode({ input })`./dist/cli.js --stdin`;

    input.push('beep');
    input.push('boop');
    input.emit('error', new Error('This stream is broken'));

    const { stderr, stdout } = await runningCommand;
    console.log(stdout);
    expect(stderr).toContain(ExitMessages.STREAM_PROCESS);
  });

  test('given the --stdin flag, it should process a stdin stream', async () => {
    const textToStream = 'Let me tell you about the Illuminati';
    const { stdout } =
      await execa`echo "${textToStream}" | ./dist/cli.js --stdin`;
    expect(stdout.toLowerCase()).toContain(textToStream.toLowerCase());
  });
});
