#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import process from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const hookPath = path.join(repoRoot, '.githooks', 'pre-commit');

function run(command) {
  return execSync(command, {
    cwd: repoRoot,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

function main() {
  try {
    run('git config core.hooksPath .githooks');
    console.log('[hooks:install] configured core.hooksPath=.githooks');
  } catch (error) {
    console.error('[hooks:install] failed to configure git hooksPath');
    console.error(error.message.split('\n')[0]);
    process.exit(1);
  }

  if (!fs.existsSync(hookPath)) {
    console.error('[hooks:install] missing .githooks/pre-commit');
    process.exit(1);
  }

  if (process.platform === 'win32') {
    console.log(
      '[hooks:install] windows detected; skipping chmod. Git hooksPath is configured.'
    );
    process.exit(0);
  }

  try {
    fs.chmodSync(hookPath, 0o755);
    console.log('[hooks:install] set executable mode on .githooks/pre-commit');
  } catch (error) {
    console.warn('[hooks:install] warning: could not set executable mode');
    console.warn(error.message.split('\n')[0]);
  }
}

main();
