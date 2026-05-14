import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourceSkill = path.join(repoRoot, 'skills/casdoor-next-auth-kit/SKILL.md');

function resolveTargetRoot(argv) {
  const target = argv[2] ?? process.cwd();
  return path.resolve(target);
}

function main() {
  const targetRoot = resolveTargetRoot(process.argv);
  const targetSkillDir = path.join(targetRoot, '.agents/skills/casdoor-next-auth-kit');
  const targetSkill = path.join(targetSkillDir, 'SKILL.md');

  if (!fs.existsSync(sourceSkill)) {
    throw new Error(`Missing source skill: ${sourceSkill}`);
  }

  fs.mkdirSync(targetSkillDir, { recursive: true });
  fs.copyFileSync(sourceSkill, targetSkill);

  console.log(`Installed skill to ${targetSkill}`);
}

main();
