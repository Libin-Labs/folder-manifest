import {
  normalizeManifestPath,
  createFolderManifest,
  compareFolderManifests,
} from '@lp-labs/folder-manifest';
const publicAPI = [normalizeManifestPath, createFolderManifest, compareFolderManifests];
const apiCount: number = publicAPI.length;
void apiCount;
const report = compareFolderManifests([], []);
const candidates: { from: string; to: string }[] = report.renameCandidates;
void candidates;
