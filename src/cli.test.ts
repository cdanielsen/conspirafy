import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(new URL('./cli.js', import.meta.url));
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

const run = (...args: string[]) =>
  spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8' });

const runWithInput = (input: string, ...args: string[]) =>
  spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8', input });

const cli = `"${process.execPath}" "${cliPath}"`;

const runInShell = (command: string) =>
  spawnSync('sh', ['-c', command], { encoding: 'utf8', timeout: 10_000 });

const assertRejected = (result: ReturnType<typeof run>) => {
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Usage: conspirafy/);
};

describe('conspirafy CLI', () => {
  it('keeps every word passed as a separate argument', () => {
    const { status, stdout } = run('foo', 'bar', 'baz');
    assert.equal(status, 0);
    assert.equal(stdout.toLowerCase(), 'foo bar baz\n');
  });

  it('accepts text starting with a dash after --', () => {
    const { status, stdout } = run('--', '-hello');
    assert.equal(status, 0);
    assert.equal(stdout.toLowerCase(), '-hello\n');
  });

  it('rejects a short unknown option', () => {
    assertRejected(run('-hello'));
  });

  it('rejects an unknown option even when text is present', () => {
    assertRejected(run('--foo', 'bar'));
  });

  it('rejects missing text when nothing is piped in', () => {
    assertRejected(run());
  });

  it('prints usage to stdout for --help', () => {
    const { status, stdout, stderr } = run('--help');
    assert.equal(status, 0);
    assert.match(stdout, /Usage: conspirafy/);
    assert.equal(stderr, '');
  });

  it('prints the package version for --version', () => {
    const { status, stdout } = run('--version');
    assert.equal(status, 0);
    assert.equal(stdout, `${packageJson.version}\n`);
  });

  it('prints a blank line for empty text', () => {
    const { status, stdout } = run('');
    assert.equal(status, 0);
    assert.equal(stdout, '\n');
  });

  it('treats numeric text as a string', () => {
    assert.equal(run('007').stdout, '007\n');
  });
});

describe('conspirafy CLI with piped input', () => {
  it('conspirafies text from a shell pipe', () => {
    const { status, stdout } = runInShell(`printf 'hello\\nworld\\n' | ${cli}`);
    assert.equal(status, 0);
    assert.equal(stdout.toLowerCase(), 'hello\nworld\n');
  });

  it('does not add a trailing newline', () => {
    assert.equal(runWithInput('hello').stdout.toLowerCase(), 'hello');
  });

  it('prefers a text argument over piped input', () => {
    assert.equal(runWithInput('ignored', 'foo').stdout.toLowerCase(), 'foo\n');
  });

  it('keeps multi-byte characters split across chunks', () => {
    // Large enough to span several reads, and offset by one byte so that
    // chunk boundaries land inside the four-byte emoji.
    const input = `a${'😀'.repeat(100_000)}`;
    assert.equal(runWithInput(input).stdout.toLowerCase(), input);
  });

  it('exits cleanly when the reader closes early', () => {
    const { status, stdout, stderr } = runInShell(
      `yes hello | ${cli} | head -1`,
    );
    assert.equal(status, 0);
    assert.equal(stdout.toLowerCase(), 'hello\n');
    assert.equal(stderr, '');
  });

  it('reports a stream failure', () => {
    const breakStdin = `
      import { Readable } from 'node:stream';
      const stdin = new Readable({
        read() {
          this.destroy(new Error('boom'));
        },
      });
      Object.defineProperty(process, 'stdin', { value: stdin });
    `;
    const { status, stderr } = spawnSync(
      process.execPath,
      [
        '--import',
        `data:text/javascript,${encodeURIComponent(breakStdin)}`,
        cliPath,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(status, 1);
    assert.match(stderr, /Failed to conspirafy stdin: boom/);
  });
});

describe('package', () => {
  it('points bin at a built file with a shebang', () => {
    const bin = new URL(`../${packageJson.bin.conspirafy}`, import.meta.url);
    assert.match(readFileSync(bin, 'utf8'), /^#!\/usr\/bin\/env node\n/);
  });
});
