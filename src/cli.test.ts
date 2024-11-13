import { runCommand } from './cli';

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('runCommand', () => {
  test('it should error if neither text or the --stdin flag is passed', async () => {

    await runCommand(undefined, { stdin: false });

    expect(console.error).toHaveBeenCalledWith('You must pass a text argument if not using --stdin');
  })
});