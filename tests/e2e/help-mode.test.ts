import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

test('built cli supports help mode end-to-end', async () => {
  const entry = path.resolve(process.cwd(), 'dist/main.js');
  const { stdout } = await execFileAsync(process.execPath, [entry, '--help']);

  assert.match(stdout, /package-diff is a CLI tool to inspect dependency changes/);
  assert.match(stdout, /analyse/);
  assert.match(stdout, /tui/);
});
