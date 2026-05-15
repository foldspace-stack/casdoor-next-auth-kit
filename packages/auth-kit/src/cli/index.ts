import packageJson from '../../package.json';

import { initProject, checkProject, updateProject } from './operations';

function printUsage() {
  console.log('Usage: npx @foldspace-fe/casdoor-next-auth-kit@latest <init|update|check>');
  console.log('       npx @foldspace-fe/casdoor-next-auth-kit@latest --help');
  console.log('       npx @foldspace-fe/casdoor-next-auth-kit@latest --version');
}

export async function runCli(argv: string[]) {
  const command = argv[0] ?? 'help';
  if (command === '--help' || command === '-h' || command === 'help') {
    printUsage();
    return;
  }
  if (command === '--version' || command === '-v') {
    console.log(packageJson.version);
    return;
  }
  if (command === 'init') return initProject();
  if (command === 'update') return updateProject();
  if (command === 'check') return checkProject();
  printUsage();
}
