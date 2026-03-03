import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '..');

function readJson(relativePath) {
  const fullPath = resolve(workspaceRoot, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

function readText(relativePath) {
  const fullPath = resolve(workspaceRoot, relativePath);
  return readFileSync(fullPath, 'utf-8');
}

function includesPattern(content, pattern, message) {
  assert.match(content, pattern, message);
}

const packageJson = readJson('package.json');
assert.ok(packageJson.scripts?.start, 'Expected npm start script to be present.');
assert.ok(packageJson.scripts?.build, 'Expected npm build script to be present.');
assert.ok(packageJson.scripts?.test, 'Expected npm test script to be present.');

const angularJson = readJson('angular.json');
const architect = angularJson.projects?.sudoku?.architect;
assert.ok(architect?.serve, 'Expected Angular serve target to be present.');
assert.ok(architect?.build, 'Expected Angular build target to be present.');
assert.ok(architect?.test, 'Expected Angular test target to be present.');

const globalStyles = readText('src/styles.css');
includesPattern(
  globalStyles,
  /overflow-x:\s*hidden;/,
  'Expected global overflow-x protection for mobile usability.',
);

const componentStyles = readText('src/app/app.component.css');
includesPattern(componentStyles, /\.app-shell\s*\{[\s\S]*display:\s*grid;/, 'Expected desktop grid layout.');
includesPattern(componentStyles, /\.board-grid\s*\{[\s\S]*width:\s*100%;/, 'Expected fluid board width.');
includesPattern(componentStyles, /\.board-grid\s*\{[\s\S]*max-width:\s*32rem;/, 'Expected capped board width.');
includesPattern(componentStyles, /\.board-grid\s*\{[\s\S]*aspect-ratio:\s*1\s*\/\s*1;/, 'Expected square board cells.');
includesPattern(componentStyles, /@media\s*\(max-width:\s*640px\)/, 'Expected mobile media query.');
includesPattern(componentStyles, /\.controls-shell\s*\{[\s\S]*flex-wrap:\s*wrap;/, 'Expected wrapped controls.');

const componentTemplate = readText('src/app/app.component.html');
includesPattern(componentTemplate, /<section class="board-shell"[\s\S]*<\/section>/, 'Expected board section.');
includesPattern(componentTemplate, /<section class="controls-shell"[\s\S]*<\/section>/, 'Expected controls section.');
includesPattern(componentTemplate, /inputmode="numeric"/, 'Expected numeric keypad hint on mobile.');

console.log('Workspace and responsive evidence checks passed.');
