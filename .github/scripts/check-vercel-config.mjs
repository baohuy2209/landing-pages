import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const folders = readdirSync(join(root, 'landing-pages'), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => `landing-pages/${entry.name}`).concat('www');
const commands = new Map(folders.map(folder => {
  const config = JSON.parse(readFileSync(join(root, folder, 'vercel.json'), 'utf8'));
  assert.equal(typeof config.ignoreCommand, 'string', `${folder}: missing ignoreCommand`);
  // Vercel rejects the deployment before cloning if this schema limit is exceeded.
  assert.ok(config.ignoreCommand.length <= 256, `${folder}: ignoreCommand exceeds 256 characters`);
  return [folder, config.ignoreCommand];
}));

const temporary = mkdtempSync(join(tmpdir(), 'landing-pages-vercel-'));
const source = join(temporary, 'source');
mkdirSync(source);
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const check = (cwd, command, previous, expected) => {
  const result = spawnSync('sh', ['-c', command], {
    cwd,
    env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: previous },
    encoding: 'utf8',
  });
  assert.equal(result.status, expected, `${cwd}: expected ${expected}, got ${result.status}\n${result.stderr}`);
};

try {
  git(source, 'init', '-q');
  git(source, 'config', 'user.name', 'Vercel config test');
  git(source, 'config', 'user.email', 'test@example.invalid');
  for (const folder of folders) {
    mkdirSync(join(source, folder), { recursive: true });
    writeFileSync(join(source, folder, 'sample'), 'initial');
  }
  git(source, 'add', '.');
  git(source, 'commit', '-qm', 'Initial fixture');
  const initial = git(source, 'rev-parse', 'HEAD');

  for (const changed of folders) {
    writeFileSync(join(source, changed, 'sample'), 'changed');
    git(source, 'commit', '-qam', `Change ${changed}`);
    for (const [folder, command] of commands) {
      check(join(source, folder), command, initial, folder === changed ? 1 : 0);
    }
    git(source, 'reset', '--hard', initial);
  }
  for (const [folder, command] of commands) {
    check(join(source, folder), command, '', 1);
    check(join(source, folder), command, 'unavailable-commit', 1);
  }

  // Vercel may clone less history than the previous successful deployment needs.
  const changed = folders[0];
  writeFileSync(join(source, changed, 'sample'), 'changed');
  git(source, 'commit', '-qam', 'A project changed');
  writeFileSync(join(source, 'README.md'), 'Unrelated follow-up commit');
  git(source, 'add', '.');
  git(source, 'commit', '-qm', 'Docs only');
  const shallow = join(temporary, 'shallow');
  git(temporary, 'clone', '-q', '--depth=1', pathToFileURL(source).href, shallow);
  assert.equal(spawnSync('git', ['cat-file', '-e', initial], { cwd: shallow }).status, 1);
  for (const [folder, command] of commands) {
    check(join(shallow, folder), command, initial, folder === changed ? 1 : 0);
  }
  console.log(`Validated ${folders.length} Vercel configs: schema length, isolated changes, first deploy, unavailable history and shallow-clone recovery.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
