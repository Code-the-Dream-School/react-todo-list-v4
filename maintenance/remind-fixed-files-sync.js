#!/usr/bin/env node

import { execSync } from 'child_process';
import process from 'process';
import { FIXED_FILES } from './fixed-files-config.js';

const fixedFileSet = new Set(FIXED_FILES);

function getStagedFiles() {
  try {
    const output = execSync(
      'git diff --cached --name-only --diff-filter=ACMR',
      {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isFixedFile(filePath) {
  return fixedFileSet.has(filePath) || filePath.startsWith('maintenance/');
}

function main() {
  const staged = getStagedFiles();
  const changedFixedFiles = staged.filter(isFixedFile);

  if (changedFixedFiles.length === 0) {
    process.exit(0);
  }

  console.log('');
  console.log(
    '[fixed-file reminder] Fixed files were included in this commit:'
  );
  changedFixedFiles.forEach((file) =>
    console.log(`[fixed-file reminder] - ${file}`)
  );
  console.log(
    '[fixed-file reminder] If this should propagate across lesson branches, run: npm run sync:fixed-files'
  );
  console.log('');
}

main();
