import type { PluginOption, UserConfig } from 'vite';
import compression from 'vite-plugin-compression';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import paths from 'vite-tsconfig-paths';
import path from 'node:path';

// https://vitejs.dev/config/
const config: UserConfig = {
	plugins: [
		tailwindcss(),
		paths() as PluginOption,
		compression(),
		react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
	],
	build: {
		minify: 'esbuild',
	},
	resolve: {
		alias: [
			{ find: '~', replacement: path.resolve(__dirname, 'src') },
			{ find: '@', replacement: __dirname },
		],
	},
	server: {
		host: true,
		port: 80,
	},
};

export default config;
