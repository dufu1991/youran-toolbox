import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss()],
	server: {
		fs: {
			allow: ['..'],
		},
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			output: {
				inlineDynamicImports: true
			}
		}
	}
});
