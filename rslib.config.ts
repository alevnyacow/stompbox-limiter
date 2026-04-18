import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
      source: {
        entry: {
          index: './src/index.ts',
          zod: './src/zod.ts'
        }
      }
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
      source: {
        entry: {
          index: './src/index.ts',
          zod: './src/zod.ts'
        }
      }
    },
  ]
});
