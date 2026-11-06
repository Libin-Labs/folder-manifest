import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeManifestPath,
  createFolderManifest,
  compareFolderManifests,
} from '../dist/esm/index.js';

test('documented workflow produces required outputs', async () => {
  const before = createFolderManifest([{ path: 'docs\\old.txt', bytes: 3, digest: 'abc' }]);
  assert.equal(normalizeManifestPath('docs\\old.txt'), 'docs/old.txt');
  const report = compareFolderManifests(before, [
    { path: 'docs/new.txt', bytes: 3, digest: 'abc' },
  ]);
  assert.deepEqual(report.renameCandidates, [{ from: 'docs/old.txt', to: 'docs/new.txt' }]);
});
test('normalization duplicates reject', () => {
  assert.throws(() =>
    createFolderManifest([
      { path: 'a/b', bytes: 0, digest: 'x' },
      { path: 'a\\b', bytes: 0, digest: 'x' },
    ]),
  );
});
test('path traversal drive and UNC reject', () => {
  for (const p of ['../a', 'C:\\a', '\\\\host\\a', 'a//b', 'a/./b'])
    assert.throws(() => normalizeManifestPath(p));
});
test('hash and size changes detected with detached results', () => {
  const before = [{ path: 'a', bytes: 1, digest: 'x' }];
  const r = compareFolderManifests(before, [{ path: 'a', bytes: 2, digest: 'x' }]);
  assert.equal(r.changed.length, 1);
  r.changed[0].bytes = 9;
  assert.equal(before[0].bytes, 1);
});
test('multiple matching files remain ambiguous candidates', () => {
  const r = compareFolderManifests(
    [{ path: 'old', bytes: 1, digest: 'x' }],
    [
      { path: 'a', bytes: 1, digest: 'x' },
      { path: 'b', bytes: 1, digest: 'x' },
    ],
  );
  assert.equal(r.renameCandidates.length, 2);
});
