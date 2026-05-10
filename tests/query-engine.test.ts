import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryEngine } from '../src/QueryEngine.js';
import { PackageManagerType } from '../src/packageDiff/analyzers/packageManagerType.js';

test('QueryEngine returns null release notes for added or removed packages', async () => {
  const engine = new QueryEngine({
    diffCalculator: {} as never,
    gitRepository: {} as never,
    packagistRegistry: {} as never,
    npmRegistry: {} as never,
    releaseNotesResolver: {} as never,
  });

  const result = await engine.loadReleaseNotes(
    {
      name: 'react',
      type: PackageManagerType.Npm,
      from: null,
      to: '18.3.1',
      status: 'added' as never,
      releases: null,
      semver: null,
      filename: 'package-lock.json',
    },
    false,
  );

  assert.equal(result, null);
});
