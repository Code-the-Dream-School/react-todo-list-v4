export const FIXED_FILES = Object.freeze([
  '.gitignore',
  '.prettierignore',
  '.prettierrc',
  'eslint.config.js',
  'vite.config.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  'README.md',
  'vercel.json',
]);

export const FIXED_DIRECTORIES = Object.freeze([
  'maintenance/',
  '.githooks/',
  '.github/',
]);

const fixedFileSet = new Set(FIXED_FILES);

export function isFixedFile(filePath) {
  return (
    fixedFileSet.has(filePath) ||
    FIXED_DIRECTORIES.some((directory) => filePath.startsWith(directory))
  );
}
