#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , jsonPathArg, htmlPathArg = 'index.html'] = process.argv;

if (!jsonPathArg) {
  console.error('Usage: node scripts/update-default-data.mjs <exported-json-path> [index-html-path]');
  process.exit(1);
}

const jsonPath = resolve(jsonPathArg);
const htmlPath = resolve(htmlPathArg);
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const html = readFileSync(htmlPath, 'utf8');
const startToken = 'const DEFAULT_DATA=';
const endToken = ';\nconst STORE_KEY=';
const start = html.indexOf(startToken);
const end = html.indexOf(endToken, start);

if (start === -1 || end === -1) {
  console.error('Could not find DEFAULT_DATA block in index.html');
  process.exit(1);
}

const serialized = JSON.stringify(data, null, 2);
const nextHtml = `${html.slice(0, start)}${startToken}${serialized}${html.slice(end)}`;
writeFileSync(htmlPath, nextHtml);
console.log(`Updated DEFAULT_DATA in ${htmlPath} from ${jsonPath}`);
