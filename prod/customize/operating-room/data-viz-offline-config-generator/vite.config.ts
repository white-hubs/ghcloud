import { defineConfig } from 'vite'
import commonjsExternals from 'vite-plugin-commonjs-externals';

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.js',
      name: 'Generator',
      fileName: 'generator'
    }
  },
  plugins: [
		commonjsExternals({
		  externals: ['fs','readline','url']
		}),
	],
})
