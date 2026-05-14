import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourceSkillDir = path.join(repoRoot, 'skills/casdoor-next-auth-kit');

function resolveTargetRoot(argv) {
  const target = argv[2] ?? process.cwd();
  return path.resolve(target);
}

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function main() {
  const targetRoot = resolveTargetRoot(process.argv);
  const targetSkillDir = path.join(targetRoot, '.agents/skills/casdoor-next-auth-kit');

  if (!fs.existsSync(sourceSkillDir)) {
    throw new Error(`Missing source skill directory: ${sourceSkillDir}`);
  }

  fs.rmSync(targetSkillDir, { force: true, recursive: true });
  copyRecursive(sourceSkillDir, targetSkillDir);

  console.log(`Installed skill to ${targetSkillDir}`);
}

main();
