import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
    stdio: 'inherit',
  });
  console.log('Git hooks installed: core.hooksPath=.githooks');
} catch (error) {
  console.warn('Skipped Git hooks installation. This usually means the package was installed outside a Git worktree.');
}
