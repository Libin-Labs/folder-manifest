export interface ManifestFile {
  path: string;
  bytes: number;
  digest: string;
}
export function normalizeManifestPath(path: string): string {
  if (typeof path !== 'string' || !path || path.length > 4096 || /[\x00-\x1f:]/.test(path))
    throw new TypeError('Invalid relative path.');
  const normalized = path.replace(/\\/g, '/');
  if (
    normalized.startsWith('/') ||
    normalized.split('/').some((part) => !part || part === '.' || part === '..')
  )
    throw new TypeError('Path must contain only relative nonempty components.');
  return normalized;
}
export function createFolderManifest(
  files: readonly ManifestFile[],
  maxFiles = 10000,
): ManifestFile[] {
  if (
    !Number.isSafeInteger(maxFiles) ||
    maxFiles < 1 ||
    maxFiles > 100000 ||
    !Array.isArray(files) ||
    files.length > maxFiles
  )
    throw new RangeError('Manifest bound exceeded.');
  const seen = new Set<string>();
  const result = files.map((file) => {
    const path = normalizeManifestPath(file.path);
    if (
      seen.has(path) ||
      !Number.isSafeInteger(file.bytes) ||
      file.bytes < 0 ||
      typeof file.digest !== 'string' ||
      !file.digest ||
      file.digest.length > 1024
    )
      throw new TypeError('Duplicate path or invalid metadata.');
    seen.add(path);
    return { path, bytes: file.bytes, digest: file.digest };
  });
  return result.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
export function compareFolderManifests(
  before: readonly ManifestFile[],
  after: readonly ManifestFile[],
  maxRenameCandidates = 10000,
) {
  if (
    !Number.isSafeInteger(maxRenameCandidates) ||
    maxRenameCandidates < 1 ||
    maxRenameCandidates > 100000
  )
    throw new RangeError('Invalid rename candidate limit.');
  const left = new Map(createFolderManifest(before).map((file) => [file.path, file]));
  const right = new Map(createFolderManifest(after).map((file) => [file.path, file]));
  const added = [...right.values()].filter((file) => !left.has(file.path));
  const removed = [...left.values()].filter((file) => !right.has(file.path));
  const changed = [...right.values()].filter((file) => {
    const previous = left.get(file.path);
    return previous && (previous.bytes !== file.bytes || previous.digest !== file.digest);
  });
  const renameCandidates: { from: string; to: string }[] = [];
  for (const from of removed)
    for (const to of added) {
      if (to.bytes !== from.bytes || to.digest !== from.digest) continue;
      if (renameCandidates.length >= maxRenameCandidates)
        throw new RangeError('Rename candidate bound exceeded.');
      renameCandidates.push({ from: from.path, to: to.path });
    }
  return { added, removed, changed, renameCandidates };
}
