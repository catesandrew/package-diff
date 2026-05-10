import test from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from '../src/main.js';

test('runCli renders package-diff help without throwing', async () => {
  const chunks: string[] = [];

  const exitCode = await runCli(
    ['node', 'package-diff', '--help'],
    {
      stdout: {
        write(chunk: string) {
          chunks.push(chunk);
        }
      }
    }
  );

  assert.equal(exitCode, 0);
  assert.match(chunks.join(''), /package-diff is a CLI tool to inspect dependency changes/);
});
