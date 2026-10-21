#!/usr/bin/env node
/**
 * Fails if anything secret-looking ended up in the built website (dist/).
 * Run after `npm run build`. Used by `npm run check`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(js|css|html|json|txt|map|svg)$/.test(name)) files.push(full);
  }
};
try {
  walk(dist);
} catch {
  console.error('No dist/ folder. Run `npm run build` first.');
  process.exit(1);
}

const patterns = [
  [/re_[A-Za-z0-9_]{16,}/, 'a Resend API key'],
  [/eyJ0eXAiOiJKV1Qi[A-Za-z0-9._-]{20,}/, 'a JWT-style API key (MailerLite keys look like this)'],
  [/RESEND_API_KEY|MAILERLITE_API_KEY|MAILERLITE_STICKER_BOOK_GROUP_ID|RATE_LIMIT_SALT/, 'a server-only setting name'],
  [/api\.resend\.com|connect\.mailerlite\.com/, 'a server-only API address'],
];

const secretValues = ['RESEND_API_KEY', 'MAILERLITE_API_KEY', 'RATE_LIMIT_SALT']
  .map((name) => [name, process.env[name]])
  .filter(([, value]) => value && value.length >= 8);

let problems = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) {
      console.error(`Found ${label} in ${path.relative(process.cwd(), file)}`);
      problems++;
    }
  }
  for (const [name, value] of secretValues) {
    if (text.includes(value)) {
      console.error(`The value of ${name} appears in ${path.relative(process.cwd(), file)}`);
      problems++;
    }
  }
}

if (problems) {
  console.error(`\n${problems} problem(s). Secrets must only be used by the server function.`);
  process.exit(1);
}
console.log(`Checked ${files.length} files in dist/: no secrets found.`);
