# @lp-labs/folder-manifest

Portable relative-path metadata manifests with exact diffs and ambiguous rename candidates.

Original independent MIT TypeScript implementation with **zero runtime/peer dependencies**. ESM and CommonJS with separate declarations, Node 18+ (browser use when adapters/APIs are available). Development dependencies are not consumer runtime dependencies.

## Install

```sh
npm install @lp-labs/folder-manifest
```

## Complete example

```js
import assert from 'node:assert/strict';
import {
  normalizeManifestPath,
  createFolderManifest,
  compareFolderManifests,
} from '@lp-labs/folder-manifest';
const before = createFolderManifest([{ path: 'docs\\old.txt', bytes: 3, digest: 'abc' }]);
assert.equal(normalizeManifestPath('docs\\old.txt'), 'docs/old.txt');
const report = compareFolderManifests(before, [{ path: 'docs/new.txt', bytes: 3, digest: 'abc' }]);
assert.deepEqual(report.renameCandidates, [{ from: 'docs/old.txt', to: 'docs/new.txt' }]);
```

CommonJS exposes the same API: `const api = require('@lp-labs/folder-manifest')`.

## Scope, customization and performance

Metadata only: caller supplies size and digest; no disk scan or hashing. Relative paths normalize backslashes to slash and reject absolute/traversal/dot/empty components/control characters/colon. Case-sensitive manifest identity (not OS extraction safety). Digest+size exact match yields ALL rename candidates including ambiguous copies; not definitive rename detection. Default10,000 files, ceiling100,000 for creation; comparisons fixed10,000 each. Inputs/results detached and sorted. Compare sorting O(files log files); rename candidates may be quadratic, bounded by an explicit candidate limit.

Configure explicit limits, clocks, policies and adapters through the API below. Error classes and standard TypeError/RangeError reject malformed input; adapter/handler errors propagate. Await asynchronous methods and handle rejection in your application; no success-shaped fallback on failed work. Inputs must be trusted ordinary data, not hostile proxies; adapters must meet documented atomicity, isolation and ownership contracts. This package never publishes data, loads external code or starts background services at import time.

## API reference

The complete exported TypeScript contract (including option defaults discussed above, method return shapes, and error codes) is included below. TypeScript users import interfaces using `import type`; JavaScript users pass matching ordinary objects. Signature optionals indicate intentionally optional fields, not silent recovery.

```ts
export interface ManifestFile {
  path: string;
  bytes: number;
  digest: string;
}
export declare function normalizeManifestPath(path: string): string;
export declare function createFolderManifest(
  files: readonly ManifestFile[],
  maxFiles?: number,
): ManifestFile[];
export declare function compareFolderManifests(
  before: readonly ManifestFile[],
  after: readonly ManifestFile[],
  maxRenameCandidates?: number,
): {
  added: ManifestFile[];
  removed: ManifestFile[];
  changed: ManifestFile[];
  renameCandidates: {
    from: string;
    to: string;
  }[];
};
```

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
