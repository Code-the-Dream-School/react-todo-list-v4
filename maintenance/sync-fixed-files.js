#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Configuration
const SOURCE_BRANCH = 'main';
const TARGET_BRANCHES = [
  '01-setup',
  '02-components-jsx',
  '03-basic-hooks-state',
  '04-events',
  '05-controlled-form',
  '06-project-organization',
  '07-data-fetching',
  '08-optimization-hooks',
  '09-advanced-state',
  '10-react-router',
  '11-deployment-security',
  '29-propagation-automation-for-readme-and-other-fixed-files-across-branches',
  'deploy',
  'deploy-vercel',
  'local-dev-vite-proxy',
];

const FIXED_FILES = [
  '.gitignore',
  '.prettierignore',
  '.prettierrc',
  'eslint.config.js',
  'vite.config.js',
  'package.json',
  '.env.example',
  'README.md',
];

// Parse CLI flags
const args = process.argv.slice(2);
const flags = {
  dryRun: args.includes('--dry-run'),
  local: args.includes('--local'),
  force: args.includes('--force'),
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: 'ℹ',
    success: '✓',
    warn: '⚠',
    error: '✗',
  }[level];
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: repoRoot,
      encoding: 'utf-8',
      stdio: options.stdio || 'pipe',
      ...options,
    });
  } catch (error) {
    if (options.throwOnError !== false) {
      throw error;
    }
    return null;
  }
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');
  } catch {
    return null;
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(path.join(repoRoot, filePath), content, 'utf-8');
}

function getCurrentBranch() {
  return exec('git rev-parse --abbrev-ref HEAD').trim();
}

function branchExists(branch) {
  try {
    exec(`git rev-parse --verify ${branch}`, { throwOnError: true });
    return true;
  } catch {
    return false;
  }
}

function isWorkingTreeClean() {
  const status = exec('git status --porcelain');
  return status.trim() === '';
}

function getMaintenanceFiles() {
  const mainDir = path.join(repoRoot, 'maintenance');
  if (!fs.existsSync(mainDir)) {
    return [];
  }
  return fs
    .readdirSync(mainDir)
    .filter((f) => !f.startsWith('.'))
    .map((f) => `maintenance/${f}`);
}

// Preflight checks
async function runPreflights() {
  log('Running preflight checks...');

  // Node version
  const nodeVersion = process.versions.node;
  const [major] = nodeVersion.split('.');
  if (parseInt(major) < 18) {
    log(`Node ${nodeVersion} is below required 18+`, 'error');
    process.exit(1);
  }

  // Git version
  try {
    const gitVersion = exec('git --version').trim();
    log(`Found ${gitVersion}`);
  } catch {
    log('Git is not installed or not in PATH', 'error');
    process.exit(1);
  }

  // Working tree
  if (!flags.force && !isWorkingTreeClean()) {
    log('Working tree is dirty. Use --force to override.', 'error');
    process.exit(1);
  }

  // Source branch
  if (!branchExists(SOURCE_BRANCH)) {
    log(`Source branch '${SOURCE_BRANCH}' does not exist`, 'error');
    process.exit(1);
  }

  // Target branches
  const missingTargets = TARGET_BRANCHES.filter((b) => !branchExists(b));
  if (missingTargets.length > 0) {
    log(`Target branches not found: ${missingTargets.join(', ')}`, 'error');
    process.exit(1);
  }

  log('All preflight checks passed', 'success');
}

// Auth probe (checks if push would succeed)
async function probeAuth() {
  if (flags.local) {
    log('Skipping auth probe (--local mode)', 'warn');
    return true;
  }

  log('Probing GitHub push viability...');
  try {
    // Use git ls-remote to check remote connectivity without modifying anything
    exec('git ls-remote origin HEAD', { stdio: 'pipe' });
    log('Remote access confirmed', 'success');
    return true;
  } catch {
    log('Unable to reach remote or authenticate', 'warn');
    return false;
  }
}

// Get synced files from source
function getSourceFiles() {
  const files = {};
  const allFiles = [...FIXED_FILES, ...getMaintenanceFiles()];

  for (const file of allFiles) {
    const content = readFile(file);
    if (content !== null) {
      files[file] = content;
    }
  }

  return files;
}

// Apply files to target branch
function applyFilesToBranch(branch, sourceFiles, dryRun = false) {
  const originalBranch = getCurrentBranch();

  try {
    if (!dryRun) {
      exec(`git checkout ${branch}`);
    }

    const changes = [];
    for (const [file, content] of Object.entries(sourceFiles)) {
      const currentContent = readFile(file);
      if (currentContent !== content) {
        changes.push(file);
        if (!dryRun) {
          writeFile(file, content);
        }
      }
    }

    return { success: true, changes, branch };
  } catch (error) {
    return { success: false, error: error.message, branch };
  } finally {
    if (!dryRun) {
      try {
        exec(`git checkout ${originalBranch}`);
      } catch {
        // Ignore checkout errors during cleanup
      }
    }
  }
}

// Sync branches
async function syncBranches(sourceFiles) {
  const results = {};
  const changedBranches = [];

  log(`\nSyncing to ${TARGET_BRANCHES.length} target branches...`);

  for (const branch of TARGET_BRANCHES) {
    const result = applyFilesToBranch(branch, sourceFiles, flags.dryRun);

    if (result.success) {
      if (result.changes.length > 0) {
        results[branch] = { status: 'changed', files: result.changes };
        changedBranches.push(branch);
        log(`${branch}: ${result.changes.length} file(s) to sync`);
      } else {
        results[branch] = { status: 'unchanged' };
        log(`${branch}: no changes`, 'success');
      }
    } else {
      results[branch] = { status: 'failed', error: result.error };
      log(`${branch}: sync failed`, 'error');
    }
  }

  return { results, changedBranches };
}

// Commit changes
async function commitChanges(changedBranches) {
  log('\nCommitting changes to target branches...');

  for (const branch of changedBranches) {
    try {
      exec(`git checkout ${branch}`);
      exec('git add .');
      exec(
        'git commit -m "chore: sync fixed files from main\n\nAutomated sync of tooling configuration, documentation, and environment examples across lesson branches."'
      );
      log(`${branch}: committed`, 'success');
    } catch (error) {
      log(`${branch}: commit failed - ${error.message}`, 'error');
    }
  }

  // Return to original branch
  const originalBranch = getCurrentBranch();
  try {
    exec(`git checkout ${originalBranch}`);
  } catch {
    // Ignore
  }
}

// Push changes
async function pushChanges(changedBranches) {
  if (flags.local) {
    log('Skipping push (--local mode)', 'warn');
    return { pushed: [], failed: [] };
  }

  log('\nPushing changes to GitHub...');
  const pushed = [];
  const failed = [];

  for (const branch of changedBranches) {
    try {
      exec(`git push origin ${branch}`);
      log(`${branch}: pushed`, 'success');
      pushed.push(branch);
    } catch (error) {
      log(`${branch}: push failed`, 'error');
      failed.push({ branch, error: error.message });
    }
  }

  return { pushed, failed };
}

// Summary output
function printSummary(results, pushResults) {
  log('\n=== SYNC SUMMARY ===');

  const changed = Object.entries(results).filter(([, r]) => r.status === 'changed');
  const unchanged = Object.entries(results).filter(([, r]) => r.status === 'unchanged');
  const failed = Object.entries(results).filter(([, r]) => r.status === 'failed');

  if (changed.length > 0) {
    log(`\nChanged (${changed.length}):`);
    changed.forEach(([branch, result]) => {
      log(`  ${branch}: ${result.files.join(', ')}`);
    });
  }

  if (unchanged.length > 0) {
    log(`\nUnchanged (${unchanged.length}):`, 'success');
    unchanged.forEach(([branch]) => {
      log(`  ${branch}`);
    });
  }

  if (failed.length > 0) {
    log(`\nFailed (${failed.length}):`, 'error');
    failed.forEach(([branch, result]) => {
      log(`  ${branch}: ${result.error}`);
    });
  }

  if (pushResults && pushResults.failed.length > 0) {
    log(`\nPush failures (${pushResults.failed.length}):`, 'warn');
    pushResults.failed.forEach(({ branch, error }) => {
      log(`  ${branch}: ${error}`);
    });
  }
}

// Main flow
async function main() {
  try {
    log('Starting fixed-file sync');
    log(`Mode: ${flags.dryRun ? 'dry-run' : flags.local ? 'local-only' : 'default (push enabled)'}`);

    // Preflight
    await runPreflights();

    // Auth probe
    const authOk = await probeAuth();
    if (!authOk && !flags.local && !flags.dryRun) {
      log('Auth probe failed. Consider using --local mode or fix authentication.', 'warn');
    }

    // Get source files
    const sourceFiles = getSourceFiles();
    log(`Syncing ${Object.keys(sourceFiles).length} fixed file(s)`);

    // Sync branches
    const { results, changedBranches } = await syncBranches(sourceFiles);

    if (flags.dryRun) {
      log('\n[DRY RUN] No changes applied.', 'info');
      printSummary(results);
      process.exit(0);
    }

    // Commit if changes exist
    if (changedBranches.length === 0) {
      log('\nNo changes to commit.', 'success');
      process.exit(0);
    }

    // Commit
    await commitChanges(changedBranches);

    // Push or ask for confirmation
    let pushResults = { pushed: [], failed: [] };
    if (flags.local) {
      log(
        '\nLocal sync completed. GitHub is not updated until branches are published.\nPush manually or re-run without --local flag.',
        'warn'
      );
    } else {
      pushResults = await pushChanges(changedBranches);

      // If push partially failed and not --local, ask for confirmation
      if (pushResults.failed.length > 0) {
        log(
          `\n${pushResults.failed.length} branch(es) failed to push. Local commits were made to ${changedBranches.length} branch(es).`,
          'warn'
        );
        const response = await prompt(
          'Continue without pushing remaining branches? (y/n): '
        );
        if (response !== 'y') {
          log('Sync cancelled.', 'warn');
          process.exit(1);
        }
        log('Continuing with local changes only.', 'warn');
      }
    }

    printSummary(results, pushResults);

    if (changedBranches.length > 0 && !pushResults.pushed.length && !flags.local) {
      log(
        '\nLocal sync completed. GitHub is not updated until branches are published.\nPush manually or re-run without --local flag.',
        'warn'
      );
    }

    log('\n✓ Sync complete', 'success');
    process.exit(0);
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
