import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/app.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'api/index.js',
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
});

console.log('✅ api/index.js successfully bundled for Vercel Serverless');
