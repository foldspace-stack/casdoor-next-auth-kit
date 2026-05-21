import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli.ts',
    'src/cli-templates.ts',
    'src/billing/index.ts',
    'src/casdoor/index.ts',
    'src/next/index.ts',
    'src/react/index.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  outDir: 'dist'
});
