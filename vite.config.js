import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin'],
  base: process.env.IS_BUILD ? '/webgpu-compute-metaballs/' : '/',
  build: {
    outDir: 'docs',
  },
})
