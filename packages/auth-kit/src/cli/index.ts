import { initProject, checkProject, updateProject } from './operations';

export async function runCli(argv: string[]) {
  const command = argv[0] ?? 'help';
  if (command === 'init') return initProject();
  if (command === 'update') return updateProject();
  if (command === 'check') return checkProject();
  console.log('Usage: npx @foldspace-fe/casdoor-next-auth-kit <init|update|check>');
}
